// src/features/tasks/screens/GoalDetailScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { AppStackParamList } from '@navigation/types/navigation';
import { Layout } from '@shared/components/Layout';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import { buildQueryKey } from '@shared/constants/queryKeys';
import AppLoader from '@shared/components/Loader/Loader';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGoalByIdAPI } from '@features/Home/api/api';
import { GoalDetailHeader } from '../components/GoalDetailHeader';
import MotivationStatsHeader from '../components/MotivationStatsHeader';
import GoalBackground from '@features/AddGoal/components/GoalBackground';
import { getGoalBackgroundVisual, getTypeVisual } from '@shared/utils/typeVisuals';
import { Height } from '@shared/components/Spacing';
import { ms, vs } from 'react-native-size-matters';
import { GoalThemeContainer } from '../components/GoalThemeContainer';
import GoalDetailBody from '../components/GoalDetailBody';
import GoalDetailCaption from '../components/GoalDetailCaption';
import { colors, platformShadow, spacing } from '@shared/theme';
import {
  isAndroid,
  PROGRESS_UPDATE_COOLDOWN_LABEL,
  PROGRESS_UPDATE_COOLDOWN_MS,
  PROGRESS_UPDATE_DEFAULT_REMAINING_TIME,
} from '@shared/utils/constants';
import GoalDetailHelpers from '../components/GoalDetailHelpers';
import { useAuth, useIsOwner } from '@features/Auth/AuthProvider';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { HelperUser, Goal as ShareGoal } from '@features/Home/types/home';
import ViewHelpersModal from '../components/ViewHelpersModal';
import SelectHelpersModal from '@features/AddGoal/components/SelectHelpersModal';
import { usePushInteraction } from '@features/Home/hooks/usePushInteraction';
import { useGoalPushes, useToggleGoalPush } from '@features/Goals/hooks/useGoalPush';
import { getFirstName, stripOuterQuotes, toShortName } from '@shared/utils/helperFunctions';
import { ProgressUpdate, GoalBeat, GoalTypeEnum } from '@features/Goals/types/goals';
import AnimatedBottomButtonWithHeader, {
  BOTTOM_BUTTON_HEIGHT,
} from '@shared/components/Buttons/AnimatedBottomButtonWithHeader';
import GoalStatusRow from '../components/GoalStatusRow';
import { useCompleteGoal } from '@features/Home/hooks/useCompleteGoal';
import { showToast } from '@shared/utils/toast';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { queryClient } from '@lib/react-query/client';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import { useModal } from '@shared/components/ModalProvider';
import TextElement from '@shared/components/TextElement/TextElement';
import Ripple from '@shared/components/Buttons/Ripple';
import Icon from '@shared/components/Icons/Icon';
import ShareModal from '@features/Share/components/ShareModal';
import AppModal from '@shared/components/AppModal/AppModal';
import { deleteGoal } from '@features/Goals/api/goalApi';
import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { showConfirmAlert } from '@shared/utils/confirmAlert';
import { useCreateGoalProgressUpdate } from '@features/Goals/hooks/useGoalProgress';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import EmptyState from '@features/Empty/EmptyState';
import CompletionBurst from '../components/CompletionBurst';
import { useSendCheer } from '@features/Goals/hooks/useGoalCheer';
import { useBlockUser, useReportTask } from '@features/Reports';

const TASK_MENU_WIDTH = ms(216);

export default function GoalDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'GoalDetail'>) {
  const {
    task: initialGoal,
    taskId,
    scrollTo,
    openUpdateComposer,
    progressUpdateId,
    beatId,
    highlightBeatId,
  } = route.params ?? {};
  const resolvedGoalId = taskId ?? initialGoal?.id;
  const [showHelperModal, setShowHelperModal] = React.useState(false);
  const [showAddHelperModal, setShowAddHelperModal] = React.useState(false);
  const [consumedAutoShare, setConsumedAutoShare] = React.useState(false);
  const [shareGoal, setShareGoal] = useState<ShareGoal | null>(null);
  const [shareVisible, setShareVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progressSectionHighlighted, setProgressSectionHighlighted] = useState(false);
  const [completionBurstKey, setCompletionBurstKey] = useState(0);
  const scrollViewRef = useRef<any>(null);
  const taskMenuButtonRef = useRef<any>(null);
  const progressSectionRef = useRef<any>(null);
  const handledProgressScrollRef = useRef(false);
  const handledProgressComposerRef = useRef(false);
  const { width: windowWidth } = useWindowDimensions();
  const [taskMenuVisible, setTaskMenuVisible] = useState(false);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    handledProgressScrollRef.current = false;
    handledProgressComposerRef.current = false;
    setProgressSectionHighlighted(false);
  }, [resolvedGoalId, scrollTo, openUpdateComposer, progressUpdateId, beatId, highlightBeatId]);

  const { user } = useAuth();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const { openModal, openShareUpdateSheet, openCheerSheet, openReportTaskSheet } = useModal();

  const { data: friends = [] } = useFollowers();

  const { data: pushData } = useGoalPushes(resolvedGoalId ?? '');
  const shareProgressUpdate = useCreateGoalProgressUpdate(resolvedGoalId ?? '');
  const sendCheer = useSendCheer(resolvedGoalId ?? '');
  const reportTask = useReportTask();
  const blockUser = useBlockUser();
  const { mutate: togglePush, isPending } = useToggleGoalPush(resolvedGoalId ?? '');
  const qc = useQueryClient();

  // Refetch the task whenever the screen regains focus so support that arrived
  // while the user was elsewhere (e.g. a cheer) shows up on return.
  useFocusEffect(
    useCallback(() => {
      if (!resolvedGoalId) return;
      qc.invalidateQueries({ queryKey: buildQueryKey.taskById(resolvedGoalId) });
    }, [qc, resolvedGoalId]),
  );

  const {
    data: taskData,
    isLoading,
    isError: isGoalQueryError,
  } = useQuery({
    queryKey: buildQueryKey.taskById(resolvedGoalId!),
    queryFn: () =>
      getGoalByIdAPI(resolvedGoalId!, {
        skipToast: true,
        skipAuthLogout: true,
      }),
    enabled: !!resolvedGoalId, // ✅ IMPORTANT
    initialData: initialGoal, // ✅ IMPORTANT
    // The owner must see support (pushes/cheers) arrive while viewing their own
    // task. Refetch when the app returns to foreground, and poll lightly while
    // the owner has the screen open.
    refetchOnWindowFocus: true,
    refetchInterval: query => {
      const data = query.state.data as { userId?: string } | undefined;
      return data && user?.id && data.userId === user.id ? 15000 : false;
    },
  });

  const task = isGoalQueryError ? null : (taskData ?? initialGoal);
  const taskError = isGoalQueryError;
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

  // The cooldown label ("share another update in …") and the disabled state are
  // derived from Date.now() at render time. Tick once a second while cooling
  // down so the countdown actually ticks and the CTA re-enables at expiry.
  const [, setCooldownTick] = React.useState(0);
  React.useEffect(() => {
    if (!isShareUpdateCoolingDown) return;
    const interval = globalThis.setInterval(() => setCooldownTick(t => t + 1), 1000);
    return () => globalThis.clearInterval(interval);
  }, [isShareUpdateCoolingDown, latestProgressUpdate?.createdAt]);
  const canViewerCheer = Boolean(hasPushed && !isOwner && !isCompleted);
  const resolvedHighlightBeatId = highlightBeatId ?? beatId ?? progressUpdateId;

  const { mutate: completeGoal } = useCompleteGoal();
  const openHelpersSheet = useCallback(() => {
    setShowHelperModal(true);
  }, []);

  const openAddHelperSheet = useCallback(() => {
    setShowAddHelperModal(true);
  }, []);

  useEffect(() => {
    if (shareVisible || !shareGoal) return;
    const timeout = setTimeout(() => {
      setShareGoal(null);
    }, 250);
    return () => clearTimeout(timeout);
  }, [shareGoal, shareVisible]);

  const handleShareGoal = useCallback((task: ShareGoal) => {
    setShareGoal(task);
    setShareVisible(true);
  }, []);

  const handleCloseShare = useCallback(() => {
    setShareVisible(false);
  }, []);

  // Owner shares a progress update — reuses the task share module.
  const handleShareUpdate = useCallback(() => {
    if (!task) return;
    handleShareGoal(task as ShareGoal);
  }, [handleShareGoal, task]);

  const handleMarkCompletePress = useCallback(() => {
    if (!task?.id) return;

    openModal('completeGoalConfirmation', {
      type: task.type,
      onConfirm: () => {
        completeGoal(task.id, {
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
  }, [completeGoal, isOwner, openModal, task?.id, task?.type]);

  const handleHelpersConfirmed = useCallback(
    async (ids: string[]) => {
      if (!task?.id) return;

      const selectedHelpers = friends.filter((friend: HelperUser) => ids.includes(friend.id));

      try {
        const { data: updatedGoal } = await api.patch<ShareGoal>(buildRoute.task(task.id), {
          helpers: ids,
        });

        qc.setQueryData(buildQueryKey.taskById(task.id), {
          ...(task as ShareGoal),
          ...updatedGoal,
          helpers: updatedGoal.helpers ?? selectedHelpers,
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

    setShareGoal(task as ShareGoal);
    setShareVisible(true);
    setConsumedAutoShare(true);
  }, [consumedAutoShare, route.params?.openShareModal, task]);

  const handleDeleteGoal = useCallback(() => {
    if (!task?.id || isDeleting) return;

    (async () => {
      try {
        setIsDeleting(true);
        await deleteGoal(task.id);
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

  const handleReportTask = useCallback(() => {
    if (!task?.id || !task?.userId) return;
    if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Report' })) return;

    openReportTaskSheet({
      ownerName: task.name,
      taskText: stripOuterQuotes(task.text),
      onSubmit: (reason, details) =>
        new Promise<void>((resolve, reject) => {
          reportTask.mutate(
            {
              taskId: task.id,
              reportedUserId: task.userId,
              reason,
              details,
            },
            {
              onSuccess: () => {
                showToast({
                  type: 'success',
                  title: 'Report submitted',
                  message: 'Thanks. We will review this task.',
                });
                resolve();
                // The task is now hidden for the reporter (cache removed in the
                // hook); leave the detail screen so they don't sit on hidden content.
                if (navigation.canGoBack()) navigation.goBack();
              },
              onError: (err: any) => {
                const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
                showToast({
                  type: 'error',
                  title: 'Report not sent',
                  message: apiMessage || 'Could not submit this report. Try again.',
                });
                reject(err);
              },
            },
          );
        }),
    });
  }, [checkAuthThenNavigate, openReportTaskSheet, reportTask, task]);

  const handleBlockUser = useCallback(() => {
    if (!task?.userId) return;
    if (!checkAuthThenNavigate(undefined, undefined, { authContext: 'Block' })) return;

    showConfirmAlert({
      title: `Block ${toShortName(task.name || 'this user')}?`,
      message: 'You will stop seeing their tasks and profile activity.',
      confirmText: 'Block',
      destructive: true,
      onConfirm: () => {
        blockUser.mutate(
          { userId: task.userId },
          {
            onSuccess: () => {
              showToast({
                type: 'success',
                title: 'User blocked',
                message: 'Their tasks will be hidden from your feed.',
              });
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            },
            onError: (err: any) => {
              const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
              showToast({
                type: 'error',
                title: 'Could not block user',
                message: apiMessage || 'Please try again in a moment.',
              });
            },
          },
        );
      },
    });
  }, [blockUser, checkAuthThenNavigate, navigation, task?.name, task?.userId]);

  const closeTaskMenu = useCallback(() => {
    setTaskMenuVisible(false);
  }, []);

  const handleOpenGoalMenu = useCallback(() => {
    if (!task?.id) return;

    const showMenu = (anchor = taskMenuAnchor) => {
      setTaskMenuAnchor(anchor);
      setTaskMenuVisible(true);
    };

    if (!taskMenuButtonRef.current?.measureInWindow) {
      showMenu();
      return;
    }

    taskMenuButtonRef.current.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        showMenu({ x, y, width, height });
      },
    );
  }, [task?.id, taskMenuAnchor]);

  const handleDeleteTaskOption = useCallback(() => {
    closeTaskMenu();
    showConfirmAlert({
      title: 'Delete task?',
      message: 'This action cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
      onConfirm: handleDeleteGoal,
    });
  }, [closeTaskMenu, handleDeleteGoal]);

  const handleReportTaskOption = useCallback(() => {
    closeTaskMenu();
    handleReportTask();
  }, [closeTaskMenu, handleReportTask]);

  const handleBlockUserOption = useCallback(() => {
    closeTaskMenu();
    handleBlockUser();
  }, [closeTaskMenu, handleBlockUser]);

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
    (beat: GoalBeat) => {
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
    if (task.type !== GoalTypeEnum.Motivation || !isOwner) return;
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

    if (task.type !== GoalTypeEnum.Motivation) {
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

  const push = usePushInteraction({
    hasPushed,
    pushCount,
    onPush: () => {
      if (!resolvedGoalId) return;
      if (task?.type === GoalTypeEnum.Motivation && isOwner) return;
      togglePush();
    },
    onUnpush: () => {
      if (!resolvedGoalId) return;
      togglePush();
    },
    isPushing: isPending,
    pushToast:
      task?.type === GoalTypeEnum.Motivation
        ? {
            pusherName: 'You',
            message: `just pushed ${toShortName(task.name)} forward`,
          }
        : undefined,
  });

  const footerContent = React.useMemo(() => {
    if (!task) return null;
    if (isCompleted) return null;

    if (task.type === GoalTypeEnum.Motivation && isOwner && !isCompleted) {
      return (
        <AnimatedBottomButtonWithHeader
          visible
          showButton={canShareProgressUpdate || !isShareUpdateCoolingDown}
          title={canShareProgressUpdate ? 'Share update' : 'Share request'}
          onPress={
            canShareProgressUpdate
              ? openShareUpdateComposer
              : () => handleShareGoal(task as ShareGoal)
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

    if (task.type === GoalTypeEnum.Motivation && !isCompleted && !isOwner && !hasPushed) {
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

    return null;
  }, [
    task?.type,
    hasPushed,
    hasShareUpdateRecipients,
    isShareUpdateCoolingDown,
    canShareProgressUpdate,
    latestProgressUpdate,
    isOwner,
    isPending,
    openShareUpdateComposer,
    handleShareGoal,
    push.handlePush,
    shareProgressUpdate.isPending,
    hasHelpers,
    openHelpersSheet,
    openAddHelperSheet,
  ]);

  const renderMotivation = React.useCallback(() => {
    return (
      <>
        <GoalDetailHeader task={task} />

        <GoalDetailCaption task={task} />

        <MotivationStatsHeader createdAt={task.createdAt} pushCount={supporterCount} />

        <Height size={vs(18)} />

        <GoalDetailBody
          task={task}
          progressSectionRef={progressSectionRef}
          highlightProgressSection={progressSectionHighlighted}
          highlightProgressUpdateId={progressUpdateId}
          highlightBeatId={resolvedHighlightBeatId}
          canViewerCheer={canViewerCheer}
          onCheerPress={handleCheerPress}
          onShareUpdate={handleShareUpdate}
          isSendingCheer={sendCheer.isPending}
        />

        {!isCompleted && (isOwner || hasHelpers) && (
          <>
            <Height size={vs(12)} />
            <GoalDetailHelpers
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

        <GoalStatusRow
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

  const renderContent = React.useMemo(() => {
    if (!task) return null;
    return renderMotivation();
  }, [task, renderMotivation]);

  if (isLoading) {
    return <AppLoader visible />;
  }

  if (taskError || !task) {
    return (
      <Layout allowPaddingVertical allowPaddingHorizontal>
        <AppHeader />

        <View style={styles.errorState}>
          <EmptyState
            title="Goal unavailable"
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

  const bg = getGoalBackgroundVisual(task.type);
  const isMotivation = task.type === GoalTypeEnum.Motivation;
  const edges: Array<'top' | 'bottom' | 'left' | 'right'> = isAndroid
    ? ['left', 'right', 'bottom']
    : ['top', 'left', 'right', 'bottom'];
  const showTaskMenu = !!task?.id && (isOwner || user?.id !== task.userId);
  const taskMenuLeft = Math.min(
    Math.max(spacing.md, taskMenuAnchor.x + taskMenuAnchor.width - TASK_MENU_WIDTH),
    Math.max(spacing.md, windowWidth - TASK_MENU_WIDTH - spacing.md),
  );
  const taskMenuTop = Math.max(spacing.md, taskMenuAnchor.y + taskMenuAnchor.height + vs(8));

  return (
    <View style={{ flex: 1 }}>
      {isMotivation ? (
        // New PushMeUp theme: flat cream background, no gradient/watermark.
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.onboardingPaper }]} />
      ) : (
        <>
          {/* 🔥 Full-screen gradient */}
          <GoalThemeContainer type={task.type} />

          {/* 🔥 Background watermark */}
          <GoalBackground icon={bg.icon} color={bg.color} iconOpacity={0.1} />
        </>
      )}

      {/* 🔥 Foreground content */}
      <Layout
        // scrollable={task.type !== GoalTypeEnum.Advice}
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
                onPress={() => handleShareGoal(task as ShareGoal)}
              >
                <Icon
                  set="ion"
                  name="share-social-outline"
                  size={ms(18)}
                  color={colors.onboardingInk}
                />
              </Ripple>
              {showTaskMenu && (
                <Pressable
                  ref={taskMenuButtonRef}
                  onPress={handleOpenGoalMenu}
                  disabled={isDeleting || blockUser.isPending}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.headerAction,
                    pressed && styles.headerActionPressed,
                  ]}
                >
                  <Icon
                    set="ion"
                    name="ellipsis-vertical"
                    size={ms(18)}
                    color={colors.onboardingInk}
                  />
                </Pressable>
              )}
            </View>
          }
        />
        <Height size={vs(20)} />

        {renderContent}
      </Layout>
      <AppModal
        visible={taskMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeTaskMenu}
      >
        <Pressable style={styles.popupBackdrop} onPress={closeTaskMenu}>
          <Pressable
            style={[
              styles.taskPopupMenu,
              {
                left: taskMenuLeft,
                top: taskMenuTop,
              },
            ]}
          >
            {isOwner ? (
              <TaskPopupMenuItem
                icon="trash-outline"
                label="Delete task"
                destructive
                onPress={handleDeleteTaskOption}
              />
            ) : (
              <>
                <TaskPopupMenuItem
                  icon="flag-outline"
                  label="Report task"
                  onPress={handleReportTaskOption}
                />
                <TaskPopupMenuItem
                  icon="ban-outline"
                  label="Block user"
                  destructive
                  onPress={handleBlockUserOption}
                />
              </>
            )}
          </Pressable>
        </Pressable>
      </AppModal>
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

      {shareGoal && (
        <ShareModal
          visible={shareVisible}
          task={shareGoal}
          isOwner={isOwner}
          onClose={handleCloseShare}
        />
      )}

      <CompletionBurst playKey={completionBurstKey} />
    </View>
  );
}

type TaskPopupMenuItemProps = {
  icon: string;
  label: string;
  destructive?: boolean;
  onPress: () => void;
};

function TaskPopupMenuItem({ icon, label, destructive = false, onPress }: TaskPopupMenuItemProps) {
  const color = destructive ? colors.error : colors.onboardingInk;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.taskPopupItem, pressed && styles.taskPopupItemPressed]}
    >
      <Icon set="ion" name={icon} size={ms(17)} color={color} />
      <TextElement style={[styles.taskPopupItemText, destructive && styles.taskPopupDangerText]}>
        {label}
      </TextElement>
    </Pressable>
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
    minWidth: ms(32),
    minHeight: ms(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(16),
  },
  headerActionPressed: {
    opacity: 0.55,
  },
  popupBackdrop: {
    flex: 1,
  },
  taskPopupMenu: {
    position: 'absolute',
    width: TASK_MENU_WIDTH,
    borderRadius: ms(14),
    paddingVertical: vs(6),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.onboardingLine,
    ...platformShadow({
      color: '#000',
      opacity: 0.16,
      radius: 18,
      offset: { width: 0, height: 10 },
    }),
  },
  taskPopupItem: {
    minHeight: vs(44),
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskPopupItemPressed: {
    backgroundColor: colors.onboardingPaper,
  },
  taskPopupItemText: {
    marginLeft: ms(10),
    fontSize: ms(15),
    fontWeight: '700',
    color: colors.onboardingInk,
  },
  taskPopupDangerText: {
    color: colors.error,
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
