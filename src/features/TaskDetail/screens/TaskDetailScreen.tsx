// src/features/tasks/screens/TaskDetailScreen.tsx
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { vs } from 'react-native-size-matters';
import { TaskThemeContainer } from '../components/TaskThemeContainer';
import TaskDetailBody from '../components/TaskDetailBody';
import TaskDetailCaption from '../components/TaskDetailCaption';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton';
import { colors } from '@shared/theme';
import { isAndroid } from '@shared/utils/constants';
import TaskDetailHelpers from '../components/TaskDetailHelpers';
import { useIsOwner } from '@features/Auth/AuthProvider';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { HelperUser } from '@features/Home/types/home';
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
import AnimatedBottomComposer, { COMPOSER_HEIGHT } from '../components/AnimatedBottomComposer';
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
export default function TaskDetailScreen({
  route,
}: NativeStackScreenProps<AppStackParamList, 'TaskDetail'>) {
  const { task: initialTask, taskId, highlightCommentId } = route.params ?? {};
  const resolvedTaskId = taskId ?? initialTask?.id;
  const openAdviceComposer = route.params?.task?.openAdviceComposer || false;
  const [showHelperModal, setShowHelperModal] = React.useState(false);
  const [adviceText, setAdviceText] = React.useState('');
  const [consumedAutoOpen, setConsumedAutoOpen] = React.useState(false);

  const { data: friends = [] } = useFollowers();

  const [showCTA, setShowCTA] = React.useState(false);
  const { data: pushData } = useTaskPushes(initialTask?.id!);
  const addComment = useAddComment(resolvedTaskId!);
  const { mutate: togglePush, isPending } = useToggleTaskPush(initialTask?.id!);

  const adviceMorph = useSharedValue(0); // 0 = button, 1 = composer

  const { data: task, isLoading } = useQuery({
    queryKey: buildQueryKey.taskById(resolvedTaskId!),
    queryFn: () => getTaskByIdAPI(resolvedTaskId!),
    enabled: !!resolvedTaskId, // ✅ IMPORTANT
    initialData: initialTask, // ✅ IMPORTANT
  });

  console.log('initialData', initialTask, openAdviceComposer);

  if (isLoading) {
    return <AppLoader visible />;
  }

  if (!task) return null;

  const bg = getTaskBackgroundVisual(task.type);
  const isOwner = useIsOwner(task?.userId);
  const hasHelpers = task.helpers?.length > 0;

  const hasPushed = pushData?.hasPushed || false;
  const pushCount = pushData?.pushCount || 0;
  const hasVoted = task?.hasVoted;
  const { emoji } = getTypeVisual(task.type);

  const { mutate: completeTask, isPending: isMarkingPending } = useCompleteTask();

  const { mutate: incompleteTask, isPending: isUnMarkingPending } = useInCompleteTask();

  useEffect(() => {
    console.log('🟢 hasVoted changed:', task?.hasVoted);
  }, [task?.hasVoted]);

  const push = usePushInteraction({
    hasPushed,
    pushCount,
    onPush: togglePush,
    onUnpush: togglePush,
    isPushing: isPending,
  });

  //ADVICE
  const isAdviceTask = task.type === TaskTypeEnum.Advice || task.type === TaskTypeEnum.Motivation;
  const hasAdvised = Boolean(task.hasAdvised);
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
    if (task.type === TaskTypeEnum.Reminder && !hasPushed) {
      return (
        <AnimatedBottomButtonWithHeader
          visible
          title={(isOwner ? '💪 ' : emoji) + `Push ${isOwner ? 'myself' : getFirstName(task.name)}`}
          onPress={push.handlePush}
          isLoading={isPending}
          buttonColor={colors.reminderBgHardest}
          containerColor={colors.onPrimary}
          buttonHeader="A small push can make a big difference."
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
          onOpenComposer={() => setShowCTA(true)}
        />
      );
    }

    return null;
  }, [
    task.type,
    canGiveAdvice,
    showCTA,
    adviceText,
    shouldOpenComposerDirectly,
    hasPushed,
    isOwner,
    emoji,
    isPending,
    hasVoted,
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

  const renderContent = React.useMemo(() => {
    switch (task.type) {
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
  }, [task.type, renderAdvice, renderMotivation, renderDecision]);

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
        allowPaddingVertical
        allowPaddingHorizontal
        backgroundColor="transparent"
      >
        <AppHeader title="Task Detail" />
        <Height size={vs(20)} />

        {renderContent}
      </Layout>
      <ViewHelpersModal
        visible={showHelperModal}
        helpers={task.helpers}
        onClose={() => setShowHelperModal(false)}
      />
    </View>
  );
}
