// src/features/tasks/screens/TaskDetailScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import MotivationStatsHeader from '../components/MotivationStatsHeader';
import TaskBackground from '@features/AddTask/components/TaskBackground';
import {
  getTaskBackgroundVisual,
  getTypeVisual,
  getTypeColor,
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
import { colors, spacing } from '@shared/theme';
import {
  isAndroid,
  PROGRESS_UPDATE_COOLDOWN_LABEL,
  PROGRESS_UPDATE_COOLDOWN_MS,
  PROGRESS_UPDATE_DEFAULT_REMAINING_TIME,
} from '@shared/utils/constants';
import TaskDetailHelpers from '../components/TaskDetailHelpers';
import { useAuth, useIsOwner } from '@features/Auth/AuthProvider';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { HelperUser, Task as ShareTask } from '@features/Home/types/home';
import ViewHelpersModal from '../components/ViewHelpersModal';
import SelectHelpersModal from '@features/AddTask/components/SelectHelpersModal';
import { usePushInteraction } from '@features/Home/hooks/usePushInteraction';
import { useTaskPushes, useToggleTaskPush } from '@features/Tasks/hooks/useTaskPush';
import {
  formatViewCount,
  getFirstName,
  stripOuterQuotes,
  toShortName,
} from '@shared/utils/helperFunctions';
import { ProgressUpdate, TaskBeat, TaskTypeEnum } from '@features/Tasks/types/tasks';
import AnimatedBottomButtonWithHeader, {
  BOTTOM_BUTTON_HEIGHT,
} from '@shared/components/Buttons/AnimatedBottomButtonWithHeader';
import TaskStatusRow from '../components/TaskStatusRow';
import { useCompleteTask } from '@features/Home/hooks/useCompleteTask';
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
import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { showConfirmAlert } from '@shared/utils/confirmAlert';
import { useCreateTaskProgressUpdate } from '@features/Tasks/hooks/useTaskProgress';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import EmptyState from '@features/Empty/EmptyState';
import CompletionBurst from '../components/CompletionBurst';
import { useSendCheer } from '@features/Tasks/hooks/useTaskCheer';

export default function TaskDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'TaskDetail'>) {
  const {
    task: initialTask,
    taskId,
    highlightCommentId,
    scrollTo,
    openUpdateComposer,
    progressUpdateId,
    beatId,
    highlightBeatId,
  } = route.params ?? {};
  const resolvedTaskId = taskId ?? initialTask?.id;
  const openAdviceComposer =
    route.params?.openAdviceComposer || Boolean((route.params?.task as any)?.openAdviceComposer);
  const [showHelperModal, setShowHelperModal] = React.useState(false);
  const [showAddHelperModal, setShowAddHelperModal] = React.useState(false);
  const [adviceText, setAdviceText] = React.useState('');
  const [consumedAutoOpen, setConsumedAutoOpen] = React.useState(false);
  const [consumedAutoShare, setConsumedAutoShare] = React.useState(false);
  const [shareTask, setShareTask] = useState<ShareTask | null>(null);
  const [shareVisible, setShareVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progressSectionHighlighted, setProgressSectionHighlighted] = useState(false);
  const [completionBurstKey, setCompletionBurstKey] = useState(0);
  const scrollViewRef = useRef<any>(null);
  const progressSectionRef = useRef<any>(null);
  const adviceSectionRef = useRef<any>(null);
  const handledProgressScrollRef = useRef(false);
  const handledProgressComposerRef = useRef(false);
  const handledAdviceScrollRef = useRef(false);

  useEffect(() => {
    handledProgressScrollRef.current = false;
    handledProgressComposerRef.current = false;
    handledAdviceScrollRef.current = false;
    setProgressSectionHighlighted(false);
  }, [
    resolvedTaskId,
    scrollTo,
    openUpdateComposer,
    progressUpdateId,
    beatId,
    highlightBeatId,
    highlightCommentId,
  ]);

  const { user } = useAuth();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const { openModal, openReminderMessageSheet, openShareUpdateSheet, openCheerSheet } = useModal();

  const { data: friends = [] } = useFollowers();

  const [showCTA, setShowCTA] = React.useState(false);
  const { data: pushData } = useTaskPushes(resolvedTaskId ?? '');
  const addComment = useAddComment(resolvedTaskId ?? '');
  const shareProgressUpdate = useCreateTaskProgressUpdate(resolvedTaskId ?? '');
  const sendCheer = useSendCheer(resolvedTaskId ?? '');
  const { mutate: togglePush, isPending } = useToggleTaskPush(resolvedTaskId ?? '');
  const qc = useQueryClient();

  const adviceMorph = useSharedValue(0); // 0 = button, 1 = composer

  const {
    data: taskData,
    isLoading,
    isError: isTaskQueryError,
  } = useQuery({
    queryKey: buildQueryKey.taskById(resolvedTaskId!),
    queryFn: () =>
      getTaskByIdAPI(resolvedTaskId!, {
        skipToast: true,
        skipAuthLogout: true,
      }),
    enabled: !!resolvedTaskId, // ✅ IMPORTANT
    initialData: initialTask, // ✅ IMPORTANT
  });

  const task = isTaskQueryError ? null : (taskData ?? initialTask);
  const taskError = isTaskQueryError;
  const isCompleted = Boolean(task?.completed || task?.completedAt);
  const isOwner = useIsOwner(task?.userId);
  const hasHelpers = !!task?.helpers?.length;
  const helperIds =
    task?.helpers?.map((helper: HelperUser | string) =>
      typeof helper === 'string' ? helper : helper.id,
    ) ?? [];

  const hasPushed = pushData?.hasPushed ?? task?.hasPushed ?? false;
  const pushCount = pushData?.pushCount || 0;
  const supporterCount = pushData?.pushCount ?? task?.pushCount ?? 0;
  const helperCount = task?.helpers?.length ?? 0;
  const hasShareUpdateRecipients = supporterCount > 0 || helperCount > 0;
  const latestProgressUpdate = React.useMemo(
    () => getLatestProgressUpdate(task?.progressUpdates),
    [task?.progressUpdates],
  );
  const isShareUpdateCoolingDown = isProgressUpdateCoolingDown(latestProgressUpdate);
  const canShareProgressUpdate = hasShareUpdateRecipients && !isShareUpdateCoolingDown;
  const hasVoted = task?.hasVoted;
  const hasReminded = task?.hasReminded;
  const canViewerCheer = Boolean(hasPushed && !isOwner && !isCompleted);
  const resolvedHighlightBeatId = highlightBeatId ?? beatId ?? progressUpdateId;

  const { emoji } = getTypeVisual(task?.type ?? TaskTypeEnum.Advice);

  const { mutate: addReminder } = useAddReminder(task?.id ?? '');

  const { mutate: completeTask } = useCompleteTask();
  const openHelpersSheet = useCallback(() => {
    setShowHelperModal(true);
  }, []);

  const openAddHelperSheet = useCallback(() => {
    setShowAddHelperModal(true);
  }, []);

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

  // Owner shares a progress update — reuses the task share module.
  const handleShareUpdate = useCallback(() => {
    if (!task) return;
    handleShareTask(task as ShareTask);
  }, [handleShareTask, task]);

  const handleMarkCompletePress = useCallback(() => {
    if (!task?.id) return;

    openModal('completeTaskConfirmation', {
      type: task.type,
      onConfirm: () => {
        completeTask(task.id, {
          onSuccess: () => {
            if (!isOwner) return;

            setCompletionBurstKey(key => key + 1);
            showToast({
              type: 'success',
              title: 'Completed — you followed through.',
            });
          },
        });
      },
    });
  }, [completeTask, isOwner, openModal, task?.id, task?.type]);

  const handleHelpersConfirmed = useCallback(
    async (ids: string[]) => {
      if (!task?.id) return;

      const selectedHelpers = friends.filter((friend: HelperUser) => ids.includes(friend.id));

      try {
        const { data: updatedTask } = await api.patch<ShareTask>(buildRoute.task(task.id), {
          helpers: ids,
        });

        qc.setQueryData(buildQueryKey.taskById(task.id), {
          ...(task as ShareTask),
          ...updatedTask,
          helpers: updatedTask.helpers ?? selectedHelpers,
        });
        qc.invalidateQueries({ queryKey: buildQueryKey.tasks() });

        showToast({
          type: 'success',
          title: 'Friends added.',
          message: 'Your task has been updated.',
        });
      } catch (error) {
        console.error('[UPDATE_HELPERS_ERROR]', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Could not update friends. Try again.',
        });
      }
    },
    [friends, qc, task],
  );

  useEffect(() => {
    if (!route.params?.openShareModal || !task || consumedAutoShare) return;

    setShareTask(task as ShareTask);
    setShareVisible(true);
    setConsumedAutoShare(true);
  }, [consumedAutoShare, route.params?.openShareModal, task]);

  const handleDeleteTask = useCallback(() => {
    if (!task?.id || isDeleting) return;

    (async () => {
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
    })();
  }, [task?.id, isDeleting, navigation, qc]);

  const handleOpenTaskMenu = useCallback(() => {
    if (!task?.id) return;

    Alert.alert('Task options', '', [
      {
        text: 'Delete task',
        style: 'destructive',
        onPress: () => {
          showConfirmAlert({
            title: 'Delete task?',
            message: 'This action cannot be undone.',
            confirmText: 'Delete',
            destructive: true,
            onConfirm: handleDeleteTask,
          });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [handleDeleteTask, task?.id]);

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

  const openShareUpdateComposer = React.useCallback(() => {
    if (!task || isCompleted) return;

    if (isProgressUpdateCoolingDown(latestProgressUpdate)) {
      showToast({
        type: 'info',
        title: 'Update already shared.',
        message: `You can share every ${PROGRESS_UPDATE_COOLDOWN_LABEL}. Try again in ${getProgressUpdateRemainingTime(
          latestProgressUpdate,
        )}.`,
      });
      return;
    }

    openShareUpdateSheet({
      taskName: task.name || 'you',
      taskText: task.text,
      type: task.type,
      onShare: msg =>
        new Promise<void>((resolve, reject) => {
          shareProgressUpdate.mutate(msg, {
            onSuccess: () => {
              showToast({
                type: 'success',
                title: 'Update shared',
                message: 'Your update has been posted.',
              });
              resolve();
            },
            onError: (err: any) => {
              const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
              showToast({
                type: 'error',
                title: 'Error',
                message: apiMessage || 'Could not share update. Try again.',
              });
              reject(err);
            },
          });
        }),
    });
  }, [isCompleted, latestProgressUpdate, openShareUpdateSheet, shareProgressUpdate, task]);

  const handleCheerPress = React.useCallback(
    (beat: TaskBeat) => {
      if (!task || !beat.beatId) return;

      if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Cheer' })) return;

      openCheerSheet({
        ownerName: getFirstName(task.name || 'them'),
        taskText: stripOuterQuotes(beat.text || task.text),
        beatType: beat.type,
        onSelectPreset: presetKey =>
          new Promise<void>((resolve, reject) => {
            sendCheer.mutate(
              {
                beatId: beat.beatId,
                presetKey,
              },
              {
                onSuccess: () => {
                  resolve();
                },
                onError: (err: any) => {
                  const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
                  showToast({
                    type: 'error',
                    title: 'Cheer not sent',
                    message: apiMessage || 'Could not send your cheer. Try again.',
                  });
                  reject(err);
                },
              },
            );
          }),
      });
    },
    [checkAuthThenNavigate, openCheerSheet, sendCheer, task],
  );

  useEffect(() => {
    if (handledProgressComposerRef.current) return;
    if (!openUpdateComposer || !task) return;
    if (task.type !== TaskTypeEnum.Motivation || !isOwner) return;
    if (isShareUpdateCoolingDown || !canShareProgressUpdate) return;

    handledProgressComposerRef.current = true;
    openShareUpdateComposer();
  }, [
    canShareProgressUpdate,
    isOwner,
    isShareUpdateCoolingDown,
    openShareUpdateComposer,
    openUpdateComposer,
    task,
  ]);

  useEffect(() => {
    let cancelled = false;

    if (handledProgressScrollRef.current) return;
    if (scrollTo !== 'progress') return;
    if (!task) return;

    const measureAndScroll = () => {
      if (cancelled) return;

      const sectionRef = progressSectionRef.current;
      const scrollNode = scrollViewRef.current?.getNativeScrollRef?.() ?? scrollViewRef.current;

      if (!sectionRef || !scrollNode || typeof sectionRef.measureLayout !== 'function') {
        globalThis.requestAnimationFrame(measureAndScroll);
        return;
      }

      sectionRef.measureLayout(
        scrollNode,
        (_x, y) => {
          if (cancelled) return;
          handledProgressScrollRef.current = true;
          scrollViewRef.current?.scrollTo?.({ y: Math.max(0, y - 24), animated: true });
          setProgressSectionHighlighted(true);

          setTimeout(() => {
            if (cancelled) return;
            setProgressSectionHighlighted(false);
          }, 1600);
        },
        () => {
          globalThis.requestAnimationFrame(measureAndScroll);
        },
      );
    };

    if (task.type !== TaskTypeEnum.Motivation) {
      handledProgressScrollRef.current = true;
      return;
    }

    if (!(task.progressUpdates?.length ?? 0)) {
      handledProgressScrollRef.current = true;
      return;
    }

    globalThis.requestAnimationFrame(measureAndScroll);

    return () => {
      cancelled = true;
    };
  }, [scrollTo, task]);

  useEffect(() => {
    let cancelled = false;

    if (handledAdviceScrollRef.current) return;
    if (!highlightCommentId) return;
    if (!task) return;

    const measureAndScroll = () => {
      if (cancelled) return;

      const sectionRef = adviceSectionRef.current;
      const scrollNode = scrollViewRef.current?.getNativeScrollRef?.() ?? scrollViewRef.current;

      if (!sectionRef || !scrollNode || typeof sectionRef.measureLayout !== 'function') {
        globalThis.requestAnimationFrame(measureAndScroll);
        return;
      }

      sectionRef.measureLayout(
        scrollNode,
        (_x, y) => {
          if (cancelled) return;
          handledAdviceScrollRef.current = true;
          scrollViewRef.current?.scrollTo?.({ y: Math.max(0, y - 24), animated: true });
        },
        () => {
          globalThis.requestAnimationFrame(measureAndScroll);
        },
      );
    };

    if (task.type !== TaskTypeEnum.Advice) {
      handledAdviceScrollRef.current = true;
      return;
    }

    globalThis.requestAnimationFrame(measureAndScroll);

    return () => {
      cancelled = true;
    };
  }, [highlightCommentId, task]);

  const push = usePushInteraction({
    hasPushed,
    pushCount,
    onPush: () => {
      if (!resolvedTaskId) return;
      if (task?.type === TaskTypeEnum.Motivation && isOwner) return;
      togglePush();
    },
    onUnpush: () => {
      if (!resolvedTaskId) return;
      togglePush();
    },
    isPushing: isPending,
    pushToast:
      task?.type === TaskTypeEnum.Motivation
        ? {
            pusherName: 'You',
            message: `just pushed ${toShortName(task.name)} forward`,
          }
        : undefined,
  });

  //ADVICE
  const isAdviceTask = task?.type === TaskTypeEnum.Advice || task?.type === TaskTypeEnum.Motivation;
  const hasAdvised = Boolean(task?.hasAdvised);
  const canGiveAdvice = isAdviceTask && !isCompleted && !isOwner && !hasAdvised;
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
    if (isCompleted) return null;
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
    if (task.type === TaskTypeEnum.Motivation && isOwner && !isCompleted) {
      return (
        <AnimatedBottomButtonWithHeader
          visible
          showButton={canShareProgressUpdate || !isShareUpdateCoolingDown}
          title={canShareProgressUpdate ? 'Share update' : 'Share request'}
          onPress={
            canShareProgressUpdate
              ? openShareUpdateComposer
              : () => handleShareTask(task as ShareTask)
          }
          isLoading={canShareProgressUpdate ? shareProgressUpdate.isPending : false}
          buttonColor={colors.onboardingPush}
          textColor={colors.onboardingInk}
          containerColor={colors.onboardingCard}
          buttonHeader={
            canShareProgressUpdate
              ? 'Keep everyone supporting you in the loop.'
              : isShareUpdateCoolingDown
                ? `You can share another update in ${getProgressUpdateRemainingTime(
                    latestProgressUpdate,
                  )}.`
                : 'Invite people to support this request.'
          }
        />
      );
    }

    if (task.type === TaskTypeEnum.Motivation && !isCompleted && !isOwner && !hasPushed) {
      return (
        <AnimatedBottomButtonWithHeader
          visible
          title={`Push ${getFirstName(task.name)}`}
          onPress={push.handlePush}
          isLoading={isPending}
          buttonColor={colors.onboardingPush}
          textColor={colors.onboardingInk}
          containerColor={colors.onboardingCard}
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
    if (task.type === TaskTypeEnum.Advice && !isCompleted && canGiveAdvice && !consumedAutoOpen) {
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
    hasShareUpdateRecipients,
    isShareUpdateCoolingDown,
    canShareProgressUpdate,
    latestProgressUpdate,
    isOwner,
    emoji,
    isPending,
    hasVoted,
    hasReminded,
    openReminderComposer,
    openShareUpdateComposer,
    handleShareTask,
    push.handlePush,
    shareProgressUpdate.isPending,
    hasHelpers,
    openHelpersSheet,
    openAddHelperSheet,
  ]);

  const renderAdvice = React.useCallback(() => {
    return (
      <>
        <TaskDetailHeader task={task} />

        <TaskDetailCaption task={task} />

        <TaskStatusRow
          containerStyle={{ marginTop: vs(-12) }}
          completed={isCompleted}
          viewsCount={task.viewCount || 0}
          isOwner={isOwner}
          taskType={task.type}
          onMarkComplete={handleMarkCompletePress}
        />

        {!isCompleted && (isOwner || hasHelpers) && (
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
              completed={isCompleted}
              onPress={openHelpersSheet}
              onAddPress={openAddHelperSheet}
            />
          </>
        )}

        <TaskDetailBody task={task} />

        {showCTA && <Height size={vs(BOTTOM_BUTTON_HEIGHT)} />}
      </>
    );
  }, [task, isOwner, showCTA, hasHelpers, openHelpersSheet, openAddHelperSheet, isCompleted]);

  const renderMotivation = React.useCallback(() => {
    return (
      <>
        <TaskDetailHeader task={task} />

        <TaskDetailCaption task={task} />

        <MotivationStatsHeader createdAt={task.createdAt} pushCount={supporterCount} />

        <Height size={vs(18)} />

        <TaskDetailBody
          task={task}
          adviceSectionRef={adviceSectionRef}
          progressSectionRef={progressSectionRef}
          highlightProgressSection={progressSectionHighlighted}
          highlightProgressUpdateId={progressUpdateId}
          highlightBeatId={resolvedHighlightBeatId}
          highlightCommentId={highlightCommentId}
          canViewerCheer={canViewerCheer}
          onCheerPress={handleCheerPress}
          onShareUpdate={handleShareUpdate}
          isSendingCheer={sendCheer.isPending}
        />

        {!isCompleted && (isOwner || hasHelpers) && (
          <>
            <Height size={vs(12)} />
            <TaskDetailHelpers
              helpers={task.helpers}
              taskType={task.type}
              isOwner={isOwner}
              completed={isCompleted}
              ownerName={task.name}
              onPress={openHelpersSheet}
              onAddPress={openAddHelperSheet}
            />
          </>
        )}

        <Height size={vs(12)} />

        <TaskStatusRow
          completed={isCompleted}
          viewsCount={task.viewCount || 0}
          isOwner={isOwner}
          taskType={task.type}
          onMarkComplete={handleMarkCompletePress}
        />
      </>
    );
  }, [
    task,
    isOwner,
    hasHelpers,
    openHelpersSheet,
    openAddHelperSheet,
    progressSectionHighlighted,
    progressUpdateId,
    resolvedHighlightBeatId,
    canViewerCheer,
    handleCheerPress,
    handleShareUpdate,
    sendCheer.isPending,
    isCompleted,
    supporterCount,
  ]);

  const renderDecision = React.useCallback(() => {
    return (
      <>
        <TaskDetailHeader task={task} />

        <TaskDetailCaption containerStyle={{ paddingBottom: vs(0) }} task={task} />

        {/* <Height size={vs(14)} /> */}

        <TaskStatusRow
          // containerStyle={{ paddingBottom: vs() }}
          completed={isCompleted}
          viewsCount={task.viewCount || 0}
          isOwner={isOwner}
          onMarkComplete={handleMarkCompletePress}
          taskType={task.type}
        />

        {!isCompleted && (isOwner || hasHelpers) && (
          <>
            <TaskDetailHelpers
              helpers={task.helpers}
              taskType={task.type}
              isOwner={isOwner}
              completed={isCompleted}
              onPress={openHelpersSheet}
              onAddPress={openAddHelperSheet}
            />
          </>
        )}
        <Height size={vs(14)} />

        <TaskDetailBody task={task} />
      </>
    );
  }, [task, isOwner, hasHelpers, openHelpersSheet, openAddHelperSheet, isCompleted]);

  const renderReminder = React.useCallback(() => {
    const remindAtDateAndTime = new Date(task?.remindAt);
    return (
      <>
        <TaskDetailHeader task={task} />

        <TaskDetailCaption containerStyle={{ paddingBottom: vs(0) }} task={task} />

        {/* <Height size={vs(14)} /> */}

        <TaskStatusRow
          // containerStyle={{ paddingBottom: vs(0) }}
          completed={isCompleted}
          viewsCount={task.viewCount || 0}
          isOwner={isOwner}
          onMarkComplete={handleMarkCompletePress}
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

        {!isCompleted && (isOwner || hasHelpers) && (
          <>
            <TaskDetailHelpers
              helpers={task.helpers}
              taskType={task.type}
              isOwner={isOwner}
              completed={isCompleted}
              onPress={openHelpersSheet}
              onAddPress={openAddHelperSheet}
            />
          </>
        )}
        <Height size={vs(18)} />

        <TaskDetailBody task={task} />
      </>
    );
  }, [task, isOwner, hasHelpers, openHelpersSheet, openAddHelperSheet]);

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

  if (taskError || !task) {
    return (
      <Layout allowPaddingVertical allowPaddingHorizontal>
        <AppHeader />

        <View style={styles.errorState}>
          <EmptyState
            title="Task unavailable"
            subtitle="This task may have been deleted, moved to private, or you may not have access."
          />

          <View style={styles.errorActions}>
            <PrimaryButton
              title="Go back"
              onPress={() => navigation.canGoBack() && navigation.goBack()}
            />
            <PrimaryButton
              title="Open Inbox"
              onPress={() => navigation.navigate('NotificationMainScreen')}
              backgroundColor={colors.surface}
              textStyle={{ color: colors.text }}
            />
          </View>
        </View>
      </Layout>
    );
  }

  const bg = getTaskBackgroundVisual(task.type);
  const isMotivation = task.type === TaskTypeEnum.Motivation;
  const edges: Array<'top' | 'bottom' | 'left' | 'right'> = isAndroid
    ? ['left', 'right', 'bottom']
    : ['top', 'left', 'right', 'bottom'];
  const showOwnerMenu = isOwner && !!task?.id;
  return (
    <View style={{ flex: 1 }}>
      {isMotivation ? (
        // New PushMeUp theme: flat cream background, no gradient/watermark.
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.onboardingPaper }]} />
      ) : (
        <>
          {/* 🔥 Full-screen gradient */}
          <TaskThemeContainer type={task.type} />

          {/* 🔥 Background watermark */}
          <TaskBackground icon={bg.icon} color={bg.color} iconOpacity={0.1} />
        </>
      )}

      {/* 🔥 Foreground content */}
      <Layout
        // scrollable={task.type !== TaskTypeEnum.Advice}
        scrollable
        ref={scrollViewRef}
        footerContent={!isCompleted ? footerContent : null}
        footerHeight={BOTTOM_BUTTON_HEIGHT}
        edgesProp={edges}
        allowPaddingVertical
        allowPaddingHorizontal={false}
        // Match the Home screen's horizontal padding (spacing.lg) instead of the
        // Layout default (spacing.md).
        scrollViewProps={{ contentContainerStyle: { paddingHorizontal: spacing.lg } }}
        backgroundColor="transparent"
      >
        <AppHeader
          right={
            <View style={styles.headerActions}>
              <Ripple
                style={styles.headerAction}
                onPress={() => handleShareTask(task as ShareTask)}
              >
                <Icon
                  set="ion"
                  name="share-social-outline"
                  size={ms(18)}
                  color={colors.onboardingInk}
                />
              </Ripple>
              {showOwnerMenu && (
                <Ripple
                  style={styles.headerAction}
                  onPress={handleOpenTaskMenu}
                  disabled={isDeleting}
                >
                  <Icon
                    set="ion"
                    name="ellipsis-vertical"
                    size={ms(18)}
                    color={colors.onboardingInk}
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
        helpers={task.helpers ?? []}
        onClose={() => setShowHelperModal(false)}
      />

      <SelectHelpersModal
        visible={showAddHelperModal}
        selected={helperIds}
        friends={friends}
        onConfirm={handleHelpersConfirmed}
        onClose={() => setShowAddHelperModal(false)}
      />

      {shareTask && (
        <ShareModal
          visible={shareVisible}
          task={shareTask}
          isOwner={isOwner}
          onClose={handleCloseShare}
        />
      )}

      <CompletionBurst playKey={completionBurstKey} />
    </View>
  );
}

function getLatestProgressUpdate(updates?: ProgressUpdate[]): ProgressUpdate | null {
  return updates?.[0] ?? null;
}

function isProgressUpdateCoolingDown(update?: ProgressUpdate | null) {
  if (!update?.createdAt) return false;

  const createdAtTime = new Date(update.createdAt).getTime();
  if (!Number.isFinite(createdAtTime)) return false;

  return Date.now() - createdAtTime < PROGRESS_UPDATE_COOLDOWN_MS;
}

function getProgressUpdateRemainingTime(update?: ProgressUpdate | null) {
  if (!update?.createdAt) return PROGRESS_UPDATE_DEFAULT_REMAINING_TIME;

  const createdAtTime = new Date(update.createdAt).getTime();
  if (!Number.isFinite(createdAtTime)) return PROGRESS_UPDATE_DEFAULT_REMAINING_TIME;

  const remainingMs = Math.max(0, PROGRESS_UPDATE_COOLDOWN_MS - (Date.now() - createdAtTime));
  const totalMinutes = Math.ceil(remainingMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${Math.max(1, minutes)}m`;
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerAction: {
    paddingHorizontal: ms(5),
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
  },
  errorActions: {
    marginTop: 16,
    gap: 12,
  },
});
