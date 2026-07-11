import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import Avatar from '@shared/components/Avatar/Avatar';
import PushButton from '@shared/components/PushButton';
import { spacing, ThemeColors, useThemedStyles } from '@shared/theme';
import { useToggleGoalPush } from '@features/Goals/hooks/useGoalPush';
import { GoalTypeEnum } from '@features/Goals/types/goals';
import type { MotivationGoal } from '@features/Home/types/home';
import { useAuth } from '@features/Auth/AuthProvider';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import { getAvatarColor } from '@shared/utils/avatarColor';
import {
  getFirstName,
  stripOuterQuotes,
  timeAgo,
  toShortName,
} from '@shared/utils/helperFunctions';
import { haptics } from '@shared/utils/haptics';
import { FIRST_TIME_HINT_COPY } from './firstTimeHints';
import { useFirstTimeHints } from './FirstTimeHintsProvider';
import { HintArrow } from './HintArrow';

// Let the feed settle before taking over the screen. Must stay well under
// LaunchModalHost's 3s delay: RN stacks modals in presentation order, so
// presenting first keeps a launch modal (if any) on top of us, not under.
const OPEN_DELAY_MS = 800;
// How long the success state lingers before the overlay lets go.
const SUCCESS_DWELL_MS = 2200;
// Precomputed for the animated-style worklet — size-matters helpers are not
// worklet-safe.
const CONTENT_LIFT = vs(16);

type Phase = 'hidden' | 'teach' | 'success';

type Props = {
  // The elected first-push goal, or null when nothing is eligible. The goal
  // is latched at open time so feed churn can't swap the card mid-flight.
  goal: MotivationGoal | null;
};

// Beat 2 as a spotlight: the app dims to a scrim, one real card floats above
// it with a live Push button, and the hint copy sits underneath. Pushing is
// the real mutation — the overlay celebrates, then gets out of the way.
export function SpotlightFirstPush({ goal }: Props) {
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const { dismissHint, markHintRendered, hasRenderedThisSession } = useFirstTimeHints();

  const [activeGoal, setActiveGoal] = useState<MotivationGoal | null>(null);
  const [phase, setPhase] = useState<Phase>('hidden');
  const closingRef = useRef(false);

  const { mutate: togglePush, isPending } = useToggleGoalPush(activeGoal?.id ?? '');

  const progress = useSharedValue(0);

  const finishClose = useCallback(() => {
    setPhase('hidden');
    setActiveGoal(null);
    closingRef.current = false;
  }, []);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    progress.value = withTiming(0, { duration: 220 }, finished => {
      if (finished) runOnJS(finishClose)();
    });
  }, [finishClose, progress]);

  // Open after a short settle delay whenever an eligible goal is elected.
  useEffect(() => {
    // Shown once per session; don't re-nag on every Home refocus.
    if (!goal || !isFocused || phase !== 'hidden' || hasRenderedThisSession('first_push_given'))
      return;

    const timer = setTimeout(() => {
      setActiveGoal(goal);
      setPhase('teach');
      markHintRendered('first_push_given');
      progress.value = 0;
      progress.value = withDelay(50, withTiming(1, { duration: 380 }));
    }, OPEN_DELAY_MS);

    return () => clearTimeout(timer);
  }, [goal, isFocused, phase, markHintRendered, hasRenderedThisSession, progress]);

  // Leaving the screen mid-teach closes silently: the hint stays pending and
  // simply tries again another time. Never punish a tab switch.
  useEffect(() => {
    if (!isFocused && phase === 'teach') {
      close();
    }
  }, [isFocused, phase, close]);

  const handleSkip = useCallback(() => {
    if (phase !== 'teach') return;
    dismissHint('first_push_given');
    close();
  }, [phase, dismissHint, close]);

  const handlePush = useCallback(() => {
    if (!activeGoal || isPending || phase !== 'teach') return;

    // Guests hand off to the auth gate exactly like the feed cards do. Close
    // first so the auth screen isn't presented underneath this modal; the
    // hint stays pending and the spotlight simply returns after sign-in.
    if (!user) {
      close();
      checkAuthThenNavigate(undefined, undefined, { authContext: 'Push' });
      return;
    }

    haptics.selection();
    togglePush(undefined, {
      onSuccess: data => {
        if (data?.hasPushed) {
          setPhase('success');
          setTimeout(close, SUCCESS_DWELL_MS);
        } else {
          close();
        }
      },
      onError: () => close(),
    });
  }, [activeGoal, isPending, phase, user, checkAuthThenNavigate, togglePush, close]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const contentStyle = useAnimatedStyle(() => {
    const transform: ViewStyle['transform'] = [
      { translateY: (1 - progress.value) * CONTENT_LIFT },
      { scale: 0.96 + progress.value * 0.04 },
    ];
    return { opacity: progress.value, transform };
  });

  if (phase === 'hidden' || !activeGoal) return null;

  const name = activeGoal.name ?? 'Someone';
  const avatarColor = activeGoal.avatarColor ?? getAvatarColor(activeGoal.userId || name);
  const pushCount = activeGoal.pushCount ?? 0;
  const isSuccess = phase === 'success';
  const copy = isSuccess
    ? (FIRST_TIME_HINT_COPY.first_push_given.followupCopyFor?.(getFirstName(name)) ??
      FIRST_TIME_HINT_COPY.first_push_given.followupCopy)
    : FIRST_TIME_HINT_COPY.first_push_given.copy;

  return (
    <Modal transparent statusBarTranslucent animationType="none" onRequestClose={handleSkip}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.scrim]}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Dismiss first push hint"
          />
        </Animated.View>

        <Animated.View
          pointerEvents="box-none"
          style={[styles.content, { width: width - spacing.lg * 2 }, contentStyle]}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Avatar
                uri={activeGoal.avatar || null}
                fallback={name}
                size={ms(40)}
                fallbackStyle={{ borderWidth: 0, backgroundColor: avatarColor }}
                textStyle={styles.avatarText}
              />
              <View style={styles.identity}>
                <TextElement style={styles.name}>{toShortName(name)}</TextElement>
                <TextElement style={styles.time}>{timeAgo(activeGoal.createdAt)}</TextElement>
              </View>
            </View>

            <TextElement style={styles.goalText}>{stripOuterQuotes(activeGoal.text)}</TextElement>

            <View style={styles.cardFooter}>
              <TextElement style={styles.pushMeta}>
                {isSuccess
                  ? `${pushCount + 1} ${pushCount + 1 === 1 ? 'push' : 'pushes'}`
                  : pushCount > 0
                    ? `${pushCount} ${pushCount === 1 ? 'push' : 'pushes'} so far`
                    : 'No pushes yet'}
              </TextElement>
              <PushButton
                onPress={handlePush}
                loading={isPending}
                active={isSuccess}
                taskType={GoalTypeEnum.Motivation}
                variant="push"
                label="Push"
                activeLabel="Pushed"
                size="sm"
              />
            </View>
          </View>

          {!isSuccess && <HintArrow style={styles.arrow} />}

          <View style={[styles.copyBlock, isSuccess && styles.copyBlockSuccess]}>
            <TextElement key={phase} style={styles.copyText}>
              {copy}
            </TextElement>
            <View style={styles.copyAccent} />
            {!isSuccess && (
              <Pressable
                onPress={handleSkip}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Skip first push hint"
              >
                <TextElement style={styles.skipText}>Skip</TextElement>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrim: {
      backgroundColor: 'rgba(8, 9, 14, 0.86)',
    },
    content: {
      alignItems: 'stretch',
    },
    card: {
      borderRadius: 28,
      backgroundColor: colors.onboardingCard,
      paddingHorizontal: ms(20),
      paddingVertical: vs(18),
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    avatarText: {
      color: colors.tactileMomentumSecondary,
      fontWeight: '800',
    },
    identity: {
      flex: 1,
    },
    name: {
      fontSize: ms(15),
      lineHeight: ms(19),
      fontWeight: '800',
      color: colors.onboardingInk,
    },
    time: {
      fontSize: ms(12),
      lineHeight: ms(16),
      color: colors.onboardingMuted,
    },
    goalText: {
      marginTop: vs(12),
      fontSize: ms(20),
      lineHeight: ms(25),
      fontWeight: '700',
      color: colors.onboardingInk,
    },
    cardFooter: {
      marginTop: vs(16),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pushMeta: {
      fontSize: ms(13),
      color: colors.onboardingMuted,
    },
    // Tip must land on the CTA in the card's bottom-right corner: shifted
    // left to sit under the button, tucked up so the head nearly touches it.
    arrow: {
      alignSelf: 'flex-end',
      marginRight: ms(48),
      marginTop: -vs(6),
      marginBottom: -vs(4),
    },
    copyBlock: {
      marginTop: vs(8),
      alignItems: 'center',
      gap: vs(12),
      paddingHorizontal: spacing.md,
    },
    copyBlockSuccess: {
      marginTop: vs(20),
    },
    copyText: {
      textAlign: 'center',
      fontSize: ms(21),
      lineHeight: ms(28),
      fontWeight: '800',
      color: 'rgba(255, 255, 255, 0.98)',
    },
    // Echoes the app's yellow highlight-underline motif (onboarding,
    // composer headings).
    copyAccent: {
      width: ms(46),
      height: vs(4),
      borderRadius: 999,
      backgroundColor: colors.onboardingPush,
      marginTop: -vs(4),
    },
    skipText: {
      fontSize: ms(14),
      lineHeight: ms(18),
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.55)',
    },
  });
