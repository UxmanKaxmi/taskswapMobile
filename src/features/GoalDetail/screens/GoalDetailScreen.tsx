// src/features/tasks/screens/GoalDetailScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { AppStackParamList } from '@navigation/types/navigation';
import { Layout } from '@shared/components/Layout';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import GoalModerationMenu from '@features/Home/components/GoalModerationMenu';
import { buildQueryKey } from '@shared/constants/queryKeys';
import AppLoader from '@shared/components/Loader/Loader';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGoalByIdAPI } from '@features/Home/api/api';
import { GoalDetailHeader } from '../components/GoalDetailHeader';
import MotivationStatsHeader from '../components/MotivationStatsHeader';
import GoalBackground from '@features/AddGoal/components/GoalBackground';
import { useTypeVisuals } from '@shared/utils/typeVisuals';
import { Height } from '@shared/components/Spacing';
import { ms, vs } from 'react-native-size-matters';
import { GoalThemeContainer } from '../components/GoalThemeContainer';
import GoalDetailBody from '../components/GoalDetailBody';
import GoalDetailCaption from '../components/GoalDetailCaption';
import { spacing, useTheme } from '@shared/theme';
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
import { useRevealGoal } from '../hooks/useRevealGoal';
import { showToast } from '@shared/utils/toast';
import { useAddComment } from '@features/Goals/hooks/useComment';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import AnimatedAdviceMorph from '../components/AnimatedAdviceMorph';
import { useMorphStagedReveal, useMorphTarget } from '@shared/morph/useMorphElement';
import { MORPH_NODE_STYLE } from '@shared/morph/MorphProvider';
import { resolveAppTextStyle } from '@shared/theme/fonts';
import { queryClient } from '@lib/react-query/client';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import ReminderWhenPicker from '@features/AddGoal/components/ReminderWhenPicker';
import { useAddReminder } from '@features/Home/hooks/useAddReminder';
import { useModal } from '@shared/components/ModalProvider';
import TextElement from '@shared/components/TextElement/TextElement';
import BackButton from '@shared/components/Buttons/BackButton';
import Ripple from '@shared/components/Buttons/Ripple';
import Icon from '@shared/components/Icons/Icon';
import ShareModal from '@features/Share/components/ShareModal';
import { deleteGoal } from '@features/Goals/api/goalApi';
import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { showConfirmAlert } from '@shared/utils/confirmAlert';
import { useCreateGoalProgressUpdate } from '@features/Goals/hooks/useGoalProgress';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import PushButton from '@shared/components/PushButton';
import CompletionBurst from '../components/CompletionBurst';
import { useSendCheer } from '@features/Goals/hooks/useGoalCheer';
import { SpotlightFirstResponse, useFirstTimeHintVisibility } from '@features/FirstTimeHints';

export default function GoalDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'GoalDetail'>) {
  const {
    task: initialGoal,
    taskId,
    highlightCommentId,
    scrollTo,
    openUpdateComposer,
    progressUpdateId,
    beatId,
    highlightBeatId,
  } = route.params ?? {};
  const { colors } = useTheme();
  const { getTypeVisual, getGoalBackgroundVisual } = useTypeVisuals();
  const resolvedGoalId = taskId ?? initialGoal?.id;
  const openAdviceComposer =
    route.params?.openAdviceComposer || Boolean((route.params?.task as any)?.openAdviceComposer);
  const [showHelperModal, setShowHelperModal] = React.useState(false);
  const [showAddHelperModal, setShowAddHelperModal] = React.useState(false);
  const [adviceText, setAdviceText] = React.useState('');
  const [consumedAutoOpen, setConsumedAutoOpen] = React.useState(false);
  const [consumedAutoShare, setConsumedAutoShare] = React.useState(false);
  const [shareGoal, setShareGoal] = useState<ShareGoal | null>(null);
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
    resolvedGoalId,
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
  const { data: pushData } = useGoalPushes(resolvedGoalId ?? '');
  const addComment = useAddComment(resolvedGoalId ?? '');
  const shareProgressUpdate = useCreateGoalProgressUpdate(resolvedGoalId ?? '');
  const sendCheer = useSendCheer(resolvedGoalId ?? '');
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

  const adviceMorph = useSharedValue(0); // 0 = button, 1 = composer

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

  // Shared-element morph target for the push button flying up from the card.
  const goalButtonMorph = useMorphTarget(
    task?.id ?? '',
    'button',
    {
      // The measured rect IS the CTA button; radius matches its real style.
      borderRadius: 14,
      backgroundColor: colors.onboardingPush,
      fontSize: ms(16),
      textColor: colors.tactileMomentumSecondary,
      paddingHorizontal: 0,
      paddingVertical: 0,
      align: 'center',
      // Matches the CTA label (TextElement weight="600", body variant).
      textStyle: resolveAppTextStyle([{ color: colors.tactileMomentumSecondary }], {
        weight: '600',
      }),
    },
    { text: task?.name ? `Push ${getFirstName(task.name)}` : undefined },
  );

  // The author block (avatar + name) flies in from the card as a node clone.
  const goalHeaderMorph = useMorphTarget(task?.id ?? '', 'header', MORPH_NODE_STYLE);

  // Detail-only content has no card counterpart: keep it hidden while the
  // shared elements fly, then fade/slide it in as the morph lands.
  const stagedStatsStyle = useMorphStagedReveal(task?.id ?? '', 0);
  const stagedBodyStyle = useMorphStagedReveal(task?.id ?? '', 1);

  const handleUnavailableGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Tabs', { screen: 'Home' });
  }, [navigation]);
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
  const canShowFirstResponseHint = useFirstTimeHintVisibility('first_response');
  const firstResponseSpotlightTask =
    task?.type === GoalTypeEnum.Motivation &&
    isOwner &&
    !isCompleted &&
    supporterCount > 0 &&
    canShowFirstResponseHint
      ? {
          id: task.id,
          text: task.text,
          name: task.name,
          pushCount: supporterCount,
        }
      : null;

  // The cooldown label ("share another update in …") and the disabled state are
  // derived from Date.now() at render time. Tick once a second while cooling
  // down so the countdown actually ticks and the CTA re-enables at expiry.
  const [, setCooldownTick] = React.useState(0);
  React.useEffect(() => {
    if (!isShareUpdateCoolingDown) return;
    const interval = globalThis.setInterval(() => setCooldownTick(t => t + 1), 1000);
    return () => globalThis.clearInterval(interval);
  }, [isShareUpdateCoolingDown, latestProgressUpdate?.createdAt]);
  const hasVoted = task?.hasVoted;
  const hasReminded = task?.hasReminded;
  const canViewerCheer = Boolean(hasPushed && !isOwner && !isCompleted);
  const resolvedHighlightBeatId = highlightBeatId ?? beatId ?? progressUpdateId;

  const { emoji } = getTypeVisual(task?.type ?? GoalTypeEnum.Advice);

  const { mutate: addReminder } = useAddReminder(task?.id ?? '');

  const { mutate: completeGoal } = useCompleteGoal();
  const { mutate: revealGoal } = useRevealGoal();
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

  const handleMarkCompletePress = useCallback(() => {
    if (!task?.id) return;

    const wasAnonymous = task.isAnonymous === true;

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

            // The reveal moment: claiming a hidden struggle at the moment of
            // victory. Offered once, right after the celebration lands.
            if (wasAnonymous) {
              setTimeout(() => {
                openModal('revealGoal', {
                  onReveal: () =>
                    revealGoal(task.id, {
                      onSuccess: () => {
                        showToast({
                          type: 'success',
                          title: 'It was you all along. Win claimed.',
                        });
                      },
                    }),
                });
              }, 1200);
            }
          },
        });
      },
    });
  }, [completeGoal, isOwner, openModal, revealGoal, task?.id, task?.type, task?.isAnonymous]);

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

  // H1: after reporting/blocking the goal is hidden for this user — leave the
  // detail screen so they don't sit on hidden content.
  const leaveAfterModeration = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const handleOpenGoalMenu = useCallback(() => {
    if (!task?.id) return;

    Alert.alert('Goal options', '', [
      {
        text: 'Delete task',
        style: 'destructive',
        onPress: () => {
          showConfirmAlert({
            title: 'Delete task?',
            message: 'This action cannot be undone.',
            confirmText: 'Delete',
            destructive: true,
            onConfirm: handleDeleteGoal,
          });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [handleDeleteGoal, task?.id]);

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

  const handleShareProgressBeat = useCallback(
    (beat: GoalBeat) => {
      if (!task) return;

      const updateText = stripOuterQuotes(beat.text || '');
      setShareGoal({
        ...(task as ShareGoal),
        id: beat.updateId ?? beat.beatId ?? task.id,
        text: updateText || task.text,
        createdAt: beat.createdAt || task.createdAt,
        pushCount: beat.cheerCount ?? task.pushCount ?? 0,
      });
      setShareVisible(true);
    },
    [task],
  );

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

    if (task.type !== GoalTypeEnum.Advice) {
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

  //ADVICE
  const isAdviceGoal = task?.type === GoalTypeEnum.Advice || task?.type === GoalTypeEnum.Motivation;
  const hasAdvised = Boolean(task?.hasAdvised);
  const canGiveAdvice = isAdviceGoal && !isCompleted && !isOwner && !hasAdvised;
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

          queryClient.setQueryData(buildQueryKey.taskById(resolvedGoalId!), (old: any) => {
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
    if (task.type === GoalTypeEnum.Reminder) {
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
              containerColor={colors.card}
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
            containerColor={colors.card}
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
            containerColor={colors.card}
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
          containerColor={colors.card}
          buttonHeader="A small nudge can make a big difference."
        />
      );
    }

    // 🔥 MOTIVATION
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
          textColor={colors.tactileMomentumSecondary}
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
          textColor={colors.tactileMomentumSecondary}
          containerColor={colors.onboardingCard}
          buttonHeader="A small push can make a big difference."
          buttonRef={goalButtonMorph.ref}
          onButtonLayout={goalButtonMorph.onLayout}
          entranceDisabled={goalButtonMorph.isActive}
          revealStyle={goalButtonMorph.animatedStyle}
        />
      );
    }

    if (task.type === GoalTypeEnum.Decision && !hasVoted) {
      return (
        <AnimatedBottomButtonWithHeader
          visible
          title={emoji + ' Cast your vote'}
          onPress={push.handlePush}
          isLoading={isPending}
          buttonColor={colors.decisionBgHardest}
          containerColor={colors.card}
          buttonHeader={
            isOwner ? 'Your vote counts too.' : 'Your vote helps shape the final decision.'
          }
          showButton={false}
        />
      );
    }

    if (task.type === GoalTypeEnum.Decision && hasVoted) {
      return (
        <AnimatedBottomButtonWithHeader
          visible
          onPress={() => {}}
          showButton={false}
          containerColor={colors.card}
          buttonHeader={`You voted for "${task.votedOption}"`}
        />
      );
    }

    // 🔥 ADVICE — STEP 1 (CTA BUTTON)
    if (task.type === GoalTypeEnum.Advice && !isCompleted && canGiveAdvice && !consumedAutoOpen) {
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
                'GoalDetail',
                {
                  taskId: resolvedGoalId,
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
    handleShareGoal,
    push.handlePush,
    shareProgressUpdate.isPending,
    hasHelpers,
    openHelpersSheet,
    openAddHelperSheet,
    colors,
    goalButtonMorph.ref,
    goalButtonMorph.onLayout,
    goalButtonMorph.isActive,
    goalButtonMorph.animatedStyle,
  ]);

  const renderAdvice = React.useCallback(() => {
    return (
      <>
        <GoalDetailHeader task={task} />

        <GoalDetailCaption task={task} />

        <GoalStatusRow
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
            <GoalDetailHelpers
              helpers={task.helpers}
              taskType={task.type}
              isOwner={isOwner}
              completed={isCompleted}
              onPress={openHelpersSheet}
              onAddPress={openAddHelperSheet}
            />
          </>
        )}

        <GoalDetailBody task={task} />

        {showCTA && <Height size={vs(BOTTOM_BUTTON_HEIGHT)} />}
      </>
    );
  }, [task, isOwner, showCTA, hasHelpers, openHelpersSheet, openAddHelperSheet, isCompleted]);

  const renderMotivation = React.useCallback(() => {
    return (
      <>
        <Animated.View
          ref={goalHeaderMorph.ref}
          onLayout={goalHeaderMorph.onLayout}
          collapsable={false}
          style={goalHeaderMorph.animatedStyle}
        >
          <GoalDetailHeader task={task} />
        </Animated.View>

        <GoalDetailCaption task={task} />

        <Animated.View style={stagedStatsStyle}>
          <MotivationStatsHeader createdAt={task.createdAt} pushCount={supporterCount} />
        </Animated.View>

        <Height size={vs(18)} />

        <Animated.View style={stagedBodyStyle}>
          <GoalDetailBody
            task={task}
            adviceSectionRef={adviceSectionRef}
            progressSectionRef={progressSectionRef}
            highlightProgressSection={progressSectionHighlighted}
            highlightProgressUpdateId={progressUpdateId}
            highlightBeatId={resolvedHighlightBeatId}
            highlightCommentId={highlightCommentId}
            canViewerCheer={canViewerCheer}
            onCheerPress={handleCheerPress}
            onShareUpdate={handleShareProgressBeat}
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
        </Animated.View>
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
    handleShareProgressBeat,
    sendCheer.isPending,
    isCompleted,
    supporterCount,
    goalHeaderMorph.ref,
    goalHeaderMorph.onLayout,
    goalHeaderMorph.animatedStyle,
    stagedStatsStyle,
    stagedBodyStyle,
  ]);

  const renderDecision = React.useCallback(() => {
    return (
      <>
        <GoalDetailHeader task={task} />

        <GoalDetailCaption containerStyle={{ paddingBottom: vs(0) }} task={task} />

        {/* <Height size={vs(14)} /> */}

        <GoalStatusRow
          // containerStyle={{ paddingBottom: vs() }}
          completed={isCompleted}
          viewsCount={task.viewCount || 0}
          isOwner={isOwner}
          onMarkComplete={handleMarkCompletePress}
          taskType={task.type}
        />

        {!isCompleted && (isOwner || hasHelpers) && (
          <>
            <GoalDetailHelpers
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

        <GoalDetailBody task={task} />
      </>
    );
  }, [task, isOwner, hasHelpers, openHelpersSheet, openAddHelperSheet, isCompleted]);

  const renderReminder = React.useCallback(() => {
    const remindAtDateAndTime = new Date(task?.remindAt);
    return (
      <>
        <GoalDetailHeader task={task} />

        <GoalDetailCaption containerStyle={{ paddingBottom: vs(0) }} task={task} />

        {/* <Height size={vs(14)} /> */}

        <GoalStatusRow
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
            <GoalDetailHelpers
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

        <GoalDetailBody task={task} />
      </>
    );
  }, [task, isOwner, hasHelpers, openHelpersSheet, openAddHelperSheet]);

  const renderContent = React.useMemo(() => {
    switch (task?.type) {
      case GoalTypeEnum.Advice:
        return renderAdvice();

      case GoalTypeEnum.Motivation:
        return renderMotivation();

      case GoalTypeEnum.Reminder:
        return renderReminder();

      case GoalTypeEnum.Decision:
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

        <View style={styles.errorScreen}>
          <View style={styles.errorState}>
            <View
              style={[
                styles.errorIconShell,
                {
                  backgroundColor: colors.onboardingCard,
                  borderColor: colors.onboardingLine,
                },
              ]}
            >
              <Icon
                set="ion"
                name="lock-closed-outline"
                size={ms(28)}
                color={colors.tactileMomentumSecondary}
              />
            </View>

            <TextElement
              variant="title"
              weight="800"
              style={[styles.errorTitle, { color: colors.onboardingInk }]}
            >
              Goal unavailable
            </TextElement>
            <TextElement
              variant="body"
              weight="500"
              style={[styles.errorSubtitle, { color: colors.onboardingMuted }]}
            >
              This goal may have been deleted, moved to private, or you may not have access.
            </TextElement>
          </View>

          <View style={styles.errorActions}>
            <PushButton
              size="lg"
              label="Go back"
              onPress={handleUnavailableGoBack}
              backgroundColor={colors.onboardingPush}
              textColor={colors.tactileMomentumSecondary}
              hideIcon
              style={styles.errorPrimaryButton}
              textStyle={styles.errorPrimaryText}
            />
            <OutlineButton
              title="Open Inbox"
              onPress={() => navigation.navigate('NotificationMainScreen')}
              borderColor={colors.onboardingLine}
              backgroundColor={colors.onboardingCard}
              textColor={colors.onboardingInk}
              style={styles.errorSecondaryButton}
              textStyle={styles.errorSecondaryText}
            />
          </View>
        </View>
      </Layout>
    );
  }

  const bg = getGoalBackgroundVisual(task.type);
  const isMotivation = task.type === GoalTypeEnum.Motivation;
  const androidApiVersion =
    typeof Platform.Version === 'number' ? Platform.Version : Number(Platform.Version);
  const shouldUseAndroidTopSafeArea = isAndroid && androidApiVersion >= 35;
  const edges: Array<'top' | 'bottom' | 'left' | 'right'> =
    isAndroid && !shouldUseAndroidTopSafeArea
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
          left={<BackButton onPress={handleUnavailableGoBack} />}
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
              {task?.id ? (
                <GoalModerationMenu
                  taskId={task.id}
                  ownerUserId={task.userId}
                  ownerName={task.name}
                  taskText={task.text}
                  onReported={leaveAfterModeration}
                  onBlocked={leaveAfterModeration}
                />
              ) : null}
              {showOwnerMenu && (
                <Ripple
                  style={styles.headerAction}
                  onPress={handleOpenGoalMenu}
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

      {shareGoal && (
        <ShareModal
          visible={shareVisible}
          task={shareGoal}
          isOwner={isOwner}
          onClose={handleCloseShare}
        />
      )}

      <SpotlightFirstResponse
        task={firstResponseSpotlightTask}
        onShareUpdate={openShareUpdateComposer}
      />

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
  errorScreen: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: vs(24),
    paddingBottom: vs(4),
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: vs(54),
  },
  errorIconShell: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(28),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(20),
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: vs(10),
  },
  errorSubtitle: {
    textAlign: 'center',
    maxWidth: ms(315),
    paddingHorizontal: ms(8),
  },
  errorActions: {
    gap: vs(10),
  },
  errorPrimaryButton: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
    marginVertical: 0,
  },
  errorPrimaryText: {
    fontSize: ms(17),
    fontWeight: '800',
  },
  errorSecondaryButton: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
    marginVertical: 0,
  },
  errorSecondaryText: {
    fontSize: ms(16),
    fontWeight: '800',
    textAlign: 'center',
  },
});
