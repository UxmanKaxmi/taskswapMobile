// src/features/tasks/screens/TaskDetailScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '@navigation/types/navigation';
import { Layout } from '@shared/components/Layout';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import { buildQueryKey } from '@shared/constants/queryKeys';
import AppLoader from '@shared/components/Loader/Loader';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTaskByIdAPI } from '@features/Home/api/api';
import { TaskDetailHeader } from '../components/TaskDetailHeader';
import TaskBackground from '@features/AddTask/components/TaskBackground';
import {
  getTaskBackgroundVisual,
  getTypeVisual,
  typeBackgroundsHard,
  typeBackgroundsHardest,
  typeIcons,
} from '@shared/utils/typeVisuals';
import TaskCardGradient from '@features/Home/components/TaskCardGradient';
import { cardStyles } from '@features/Home/components/styles';
import { Height } from '@shared/components/Spacing';
import { ms, vs } from 'react-native-size-matters';
import { TaskThemeContainer } from '../components/TaskThemeContainer';
import TaskDetailBody from '../components/TaskDetailBody';
import TaskDetailCaption from '../components/TaskDetailCaption';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton';
import { colors } from '@shared/theme';
import { isAndroid } from '@shared/utils/constants';
import TaskDetailHelpers from '../components/TaskDetailHelpers';
import { useAuth, useIsOwner } from '@features/Auth/AuthProvider';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { HelperUser, Task as ShareTask } from '@features/Home/types/home';
import ViewHelpersModal from '../components/ViewHelpersModal';
import { usePushInteraction } from '@features/Home/hooks/usePushInteraction';
import { useTaskPushes, useToggleTaskPush } from '@features/Tasks/hooks/useTaskPush';
import { formatViewCount, getFirstName } from '@shared/utils/helperFunctions';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import AnimatedBottomButtonWithHeader, {
  BOTTOM_BUTTON_HEIGHT,
} from '@shared/components/Buttons/AnimatedBottomButtonWithHeader';
import TaskStatusRow from '../components/TaskStatusRow';
import { useCompleteTask } from '@features/Home/hooks/useCompleteTask';
import { useInCompleteTask } from '@features/Home/hooks/useInCompleteTask';
import { showToast } from '@shared/utils/toast';
import { useAddComment } from '@features/Tasks/hooks/useComment';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import AnimatedAdviceMorph from '../components/AnimatedAdviceMorph';
import { queryClient } from '@lib/react-query/client';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import ReminderWhenPicker from '@features/AddTask/components/ReminderWhenPicker';
import { useAddReminder } from '@features/Home/hooks/useAddTask';
import { useModal } from '@shared/components/ModalProvider';
import TextElement from '@shared/components/TextElement/TextElement';
import Ripple from '@shared/components/Buttons/Ripple';
import Icon from '@shared/components/Icons/Icon';
import ShareModal from '@features/Share/components/ShareModal';
import { deleteTask } from '@features/Tasks/api/taskApi';
export default function TaskDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'TaskDetail'>) {
  const { task: initialTask, taskId, highlightCommentId } = route.params ?? {};
  const resolvedTaskId = taskId ?? initialTask?.id;
  const openAdviceComposer = route.params?.task?.openAdviceComposer || false;
  const [showHelperModal, setShowHelperModal] = React.useState(false);
  const [adviceText, setAdviceText] = React.useState('');
  const [consumedAutoOpen, setConsumedAutoOpen] = React.useState(false);
  const [shareTask, setShareTask] = useState<ShareTask | null>(null);
  const [shareVisible, setShareVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const { openReminderMessageSheet } = useModal();

  const { data: friends = [] } = useFollowers();

  const [showCTA, setShowCTA] = React.useState(false);
  const { data: pushData } = useTaskPushes(resolvedTaskId ?? '');
  const addComment = useAddComment(resolvedTaskId ?? '');
  const { mutate: togglePush, isPending } = useToggleTaskPush(resolvedTaskId ?? '');
  const qc = useQueryClient();

  const adviceMorph = useSharedValue(0); // 0 = button, 1 = composer

  const { data: taskData, isLoading } = useQuery({
    queryKey: buildQueryKey.taskById(resolvedTaskId!),
    queryFn: () => getTaskByIdAPI(resolvedTaskId!),
    enabled: !!resolvedTaskId, // ✅ IMPORTANT
    initialData: initialTask, // ✅ IMPORTANT
  });

  const task = taskData ?? initialTask;
  const isOwner = useIsOwner(task?.userId);
  const hasHelpers = !!task?.helpers?.length;

  const hasPushed = pushData?.hasPushed || false;
  const pushCount = pushData?.pushCount || 0;
  const hasVoted = task?.hasVoted;
  const hasReminded = task?.hasReminded;

  const { emoji } = getTypeVisual(task?.type ?? TaskTypeEnum.Advice);

  const { mutate: addReminder } = useAddReminder(task?.id ?? '');

  const { mutate: completeTask, isPending: isMarkingPending } = useCompleteTask();
  const { mutate: incompleteTask, isPending: isUnMarkingPending } = useInCompleteTask();

  useEffect(() => {
    if (shareVisible || !shareTask) return;
    const timeout = setTimeout(() => {
      setShareTask(null);
    }, 250);
    return () => clearTimeout(timeout);
  }, [shareTask, shareVisible]);

  const handleShareTask = useCallback((task: ShareTask) => {
    setShareTask(task);
    setShareVisible(true);
  }, []);

  const handleCloseShare = useCallback(() => {
    setShareVisible(false);
  }, []);

  const handleDeleteTask = useCallback(() => {
    if (!task?.id || isDeleting) return;
    Alert.alert('Delete Task (Dev)', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await deleteTask(task.id);
            qc.removeQueries({ queryKey: buildQueryKey.taskById(task.id) });
            qc.invalidateQueries({ queryKey: buildQueryKey.tasks() });
            navigation.goBack();
          } catch (error) {
            console.error('[DELETE_TASK_ERROR]', error);
            showToast({
              type: 'error',
              title: 'Error',
              message: 'Failed to delete task.',
            });
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  }, [task?.id, isDeleting, navigation, qc]);

  const openReminderComposer = React.useCallback(() => {
    if (!task) return;

    openReminderMessageSheet({
      taskName: task.name || 'Someone',
      taskText: task.text,
      onSend: msg =>
        new Promise<void>((resolve, reject) => {
          addReminder(msg, {
            onSuccess: () => {
              showToast({
                type: 'success',
                title: 'Sent 🎉',
                message: 'Your reminder has been sent!',
              });
              resolve();
            },
            onError: (err: any) => {
              showToast({
                type: 'error',
                title: 'Error',
                message: err?.response?.data?.error || 'Failed to send reminder.',
              });
              reject(err);
            },
          });
        }),
    });
  }, [task, addReminder, openReminderMessageSheet]);

  const push = usePushInteraction({
    hasPushed,
    pushCount,
    onPush: () => {
      if (!resolvedTaskId) return;
      togglePush();
    },
    onUnpush: () => {
      if (!resolvedTaskId) return;
      togglePush();
    },
    isPushing: isPending,
  });

  //ADVICE
  const isAdviceTask = task?.type === TaskTypeEnum.Advice || task?.type === TaskTypeEnum.Motivation;
  const hasAdvised = Boolean(task?.hasAdvised);
  const canGiveAdvice = isAdviceTask && !isOwner && !hasAdvised;
  const shouldOpenComposerDirectly = openAdviceComposer && canGiveAdvice && !consumedAutoOpen;

  useEffect(() => {
    if (shouldOpenComposerDirectly) {
      setShowCTA(true);
      return;
    }

    // default: composer closed
    setShowCTA(false);
  }, [shouldOpenComposerDirectly]);

  useEffect(() => {
    adviceMorph.value = withTiming(showCTA ? 1 : 0, {
      duration: 320,
    });
  }, [showCTA]);

  const handleSubmitAdvice = () => {
    const text = adviceText.trim();
    if (!text) return;

    addComment.mutate(
      { text, mentions: [] },
      {
        onSuccess: () => {
          setAdviceText('');
          setShowCTA(false); // 👈 morph back to button

          setConsumedAutoOpen(true);

          queryClient.setQueryData(buildQueryKey.taskById(resolvedTaskId!), (old: any) => {
            if (!old) return old;
            return {
              ...old,
              hasAdvised: true, // 🔥 lock advice permanently
            };
          });

          showToast({
            type: 'success',
            title: 'Advice shared',
            message: 'Your advice has been posted.',
          });
        },
        onError: () => {
          showToast({
            type: 'error',
            title: 'Failed',
            message: 'Could not share advice. Try again.',
          });
        },
      },
    );
  };

  const footerContent = React.useMemo(() => {
    if (!task) return null;
    if (task.type === TaskTypeEnum.Reminder) {
      // OWNER
      if (isOwner) {
        // If owner already reminded (or you can decide based on reminderNoteCount)
        if (task.hasReminded) {
          return (
            <AnimatedBottomButtonWithHeader
              visible
              title="✅ Reminder sent"
              onPress={() => {}}
              isLoading={false}
              buttonColor={colors.border}
              containerColor={colors.onPrimary}
              buttonHeader="You've already sent a reminder."
              // If your component supports it:
              // disabled
            />
          );
        }

        // Owner can send reminder to self (if that's your intended behavior)
        return (
          <AnimatedBottomButtonWithHeader
            visible={false}
            title={`✅ You nudged ${getFirstName(task.name)}`}
            onPress={() => {}}
            isLoading={false}
            buttonColor={colors.border}
            containerColor={colors.onPrimary}
            buttonHeader="You’ve already sent a reminder."
            showButton={false}
            // disabled
          />
        );
      }

      // NON-OWNER
      if (task.hasReminded) {
        return (
          <AnimatedBottomButtonWithHeader
            visible
            title={`✅ You nudged ${getFirstName(task.name)}`}
            onPress={() => {}}
            isLoading={false}
            buttonColor={colors.border}
            containerColor={colors.onPrimary}
            buttonHeader="You’ve already sent a reminder."
            showButton={false}

            // disabled
          />
        );
      }

      // NON-OWNER — can nudge (same as your PushButton logic)
      return (
        <AnimatedBottomButtonWithHeader
          visible
          title={`${emoji} Send reminder`}
          onPress={() => {
            if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Reminder' })) return;
            openReminderComposer();
          }}
          isLoading={isPending}
          buttonColor={colors.reminderBgHardest}
          containerColor={colors.onPrimary}
          buttonHeader="A small nudge can make a big difference."
        />
      );
    }

    // 🔥 MOTIVATION
    if (task.type === TaskTypeEnum.Motivation && !hasPushed) {
      return (
        <AnimatedBottomButtonWithHeader
          visible
          title={(isOwner ? '💪 ' : emoji) + `Push ${isOwner ? 'myself' : getFirstName(task.name)}`}
          onPress={push.handlePush}
          isLoading={isPending}
          buttonColor={colors.motivationBgHardest}
          containerColor={colors.onPrimary}
          buttonHeader="A small push can make a big difference."
        />
      );
    }

    if (task.type === TaskTypeEnum.Decision && !hasVoted) {
      return (
        <AnimatedBottomButtonWithHeader
          visible
          title={emoji + ' Cast your vote'}
          onPress={push.handlePush}
          isLoading={isPending}
          buttonColor={colors.decisionBgHardest}
          containerColor={colors.onPrimary}
          buttonHeader={
            isOwner ? 'Your vote counts too.' : 'Your vote helps shape the final decision.'
          }
          showButton={false}
        />
      );
    }

    if (task.type === TaskTypeEnum.Decision && hasVoted) {
      return (
        <AnimatedBottomButtonWithHeader
          visible
          onPress={() => {}}
          showButton={false}
          containerColor={colors.onPrimary}
          buttonHeader={`You voted for "${task.votedOption}"`}
        />
      );
    }

    // 🔥 ADVICE — STEP 1 (CTA BUTTON)
    if (task.type === TaskTypeEnum.Advice && canGiveAdvice && !consumedAutoOpen) {
      return (
        <AnimatedAdviceMorph
          progress={adviceMorph}
          adviceText={adviceText}
          onChangeText={setAdviceText}
          autoFocus={shouldOpenComposerDirectly}
          onSubmit={handleSubmitAdvice}
          onOpenComposer={() => {
            if (!user) {
              checkAuthThenNavigate(
                'TaskDetail',
                {
                  taskId: resolvedTaskId,
                  task: task ? { ...task, openAdviceComposer: true } : undefined,
                  openAdviceComposer: true,
                  highlightCommentId: route.params?.highlightCommentId,
                },
                {
                  authContext: 'Advice',
                },
              );
              return;
            }
            setShowCTA(true);
          }}
          isComposerOpen={showCTA}
        />
      );
    }

    return null;
  }, [
    task?.type,
    canGiveAdvice,
    showCTA,
    adviceText,
    shouldOpenComposerDirectly,
    hasPushed,
    isOwner,
    emoji,
    isPending,
    hasVoted,
    hasReminded,
    openReminderComposer,
  ]);

  const renderAdvice = React.useCallback(() => {
    return (
      <>
        <TaskDetailHeader task={task} />

        <TaskDetailCaption task={task} />

        <TaskStatusRow
          containerStyle={{ marginTop: vs(-12) }}
          completed={task.completed}
          viewsCount={task.viewCount || 0}
          isOwner={isOwner}
          onMarkComplete={() => {
            task.completed ? incompleteTask(task.id) : completeTask(task.id);
          }}
        />

        {hasHelpers && (
          <>
            <Height
              style={{
                marginTop: vs(-20),
              }}
            />
            <TaskDetailHelpers
              helpers={task.helpers}
              taskType={task.type}
              isOwner={isOwner}
              onPress={() => setShowHelperModal(true)}
            />
          </>
        )}

        <TaskDetailBody task={task} />

        {showCTA && <Height size={vs(BOTTOM_BUTTON_HEIGHT)} />}
      </>
    );
  }, [task, isOwner, showCTA]);

  const renderMotivation = React.useCallback(() => {
    return (
      <>
        <TaskDetailHeader task={task} />

        <TaskDetailCaption task={task} />

        <Height size={vs(14)} />

        <TaskDetailBody task={task} />

        {(isOwner || hasHelpers) && (
          <>
            <Height size={vs(12)} />
            <TaskDetailHelpers
              helpers={task.helpers}
              taskType={task.type}
              isOwner={isOwner}
              onPress={() => setShowHelperModal(true)}
            />
          </>
        )}

        <Height size={vs(12)} />

        <TaskStatusRow
          completed={task.completed}
          viewsCount={task.viewCount || 0}
          isOwner={isOwner}
          onMarkComplete={() => {
            task.completed ? incompleteTask(task.id) : completeTask(task.id);
          }}
        />
      </>
    );
  }, [task, isOwner, hasHelpers]);

  const renderDecision = React.useCallback(() => {
    return (
      <>
        <TaskDetailHeader task={task} />

        <TaskDetailCaption containerStyle={{ paddingBottom: vs(0) }} task={task} />

        {/* <Height size={vs(14)} /> */}

        <TaskStatusRow
          // containerStyle={{ paddingBottom: vs() }}
          completed={task.completed}
          viewsCount={task.viewCount || 0}
          isOwner={isOwner}
          onMarkComplete={() => {
            task.completed ? incompleteTask(task.id) : completeTask(task.id);
          }}
          taskType={task.type}
        />

        {(isOwner || hasHelpers) && (
          <>
            <TaskDetailHelpers
              helpers={task.helpers}
              taskType={task.type}
              isOwner={isOwner}
              onPress={() => setShowHelperModal(true)}
            />
          </>
        )}
        <Height size={vs(14)} />

        <TaskDetailBody task={task} />
      </>
    );
  }, [task, isOwner]);

  const renderReminder = React.useCallback(() => {
    const remindAtDateAndTime = new Date(task?.remindAt);
    return (
      <>
        <TaskDetailHeader task={task} />

        <TaskDetailCaption containerStyle={{ paddingBottom: vs(0) }} task={task} />

        {/* <Height size={vs(14)} /> */}

        <TaskStatusRow
          // containerStyle={{ paddingBottom: vs(0) }}
          completed={task.completed}
          viewsCount={task.viewCount || 0}
          isOwner={isOwner}
          onMarkComplete={() => {
            task.completed ? incompleteTask(task.id) : completeTask(task.id);
          }}
          taskType={task.type}
        />
        <Height size={vs(2)} />

        <ReminderWhenPicker
          date={remindAtDateAndTime}
          time={remindAtDateAndTime}
          readOnly
          removeHeading
          removeBottomDescription
        />

        {(isOwner || hasHelpers) && (
          <>
            <TaskDetailHelpers
              helpers={task.helpers}
              taskType={task.type}
              isOwner={isOwner}
              onPress={() => setShowHelperModal(true)}
            />
          </>
        )}
        <Height size={vs(18)} />

        <TaskDetailBody task={task} />
      </>
    );
  }, [task, isOwner]);

  const renderContent = React.useMemo(() => {
    switch (task?.type) {
      case TaskTypeEnum.Advice:
        return renderAdvice();

      case TaskTypeEnum.Motivation:
        return renderMotivation();

      case TaskTypeEnum.Reminder:
        return renderReminder();

      case TaskTypeEnum.Decision:
        return renderDecision();

      default:
        return null;
    }
  }, [task?.type, renderAdvice, renderMotivation, renderDecision]);

  if (isLoading) {
    return <AppLoader visible />;
  }

  if (!task) return null;

  const bg = getTaskBackgroundVisual(task.type);
  const edges = isAndroid ? ['left', 'right', 'bottom'] : ['top', 'left', 'right', 'bottom'];
  const showDevDelete = __DEV__ && !!task?.id;
  return (
    <View style={{ flex: 1 }}>
      {/* 🔥 Full-screen gradient */}
      <TaskThemeContainer type={task.type} />

      {/* 🔥 Background watermark */}
      <TaskBackground icon={bg.icon} color={bg.color} iconOpacity={0.1} />

      {/* 🔥 Foreground content */}
      <Layout
        // scrollable={task.type !== TaskTypeEnum.Advice}
        scrollable
        footerContent={footerContent}
        footerHeight={BOTTOM_BUTTON_HEIGHT}
        edgesProp={edges}
        allowPaddingVertical
        allowPaddingHorizontal
        backgroundColor="transparent"
      >
        <AppHeader
          title="Task Detail"
          right={
            <View style={styles.headerActions}>
              <Ripple style={styles.headerAction} onPress={() => handleShareTask(task as ShareTask)}>
                <Icon set="ion" name="share-outline" size={ms(18)} color={colors.text} />
              </Ripple>
              {showDevDelete && (
                <Ripple
                  style={[styles.headerAction, styles.headerActionDelete]}
                  onPress={handleDeleteTask}
                  disabled={isDeleting}
                >
                  <Icon
                    set="ion"
                    name="trash-outline"
                    size={ms(18)}
                    color={isDeleting ? colors.muted : colors.error}
                  />
                </Ripple>
              )}
            </View>
          }
        />
        <Height size={vs(20)} />

        {renderContent}
      </Layout>
      <ViewHelpersModal
        visible={showHelperModal}
        helpers={task.helpers}
        onClose={() => setShowHelperModal(false)}
      />

      {shareTask && (
        <ShareModal visible={shareVisible} task={shareTask} onClose={handleCloseShare} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerAction: {
    paddingHorizontal: ms(2),
  },
  headerActionDelete: {
    marginLeft: ms(6),
  },
});
