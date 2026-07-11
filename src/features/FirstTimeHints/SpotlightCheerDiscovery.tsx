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

import Avatar from '@shared/components/Avatar/Avatar';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import Ripple from '@shared/components/Buttons/Ripple';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { getAvatarColor } from '@shared/utils/avatarColor';
import {
  getFirstName,
  stripOuterQuotes,
  timeAgo,
  toShortName,
} from '@shared/utils/helperFunctions';
import { showToast } from '@shared/utils/toast';
import { haptics } from '@shared/utils/haptics';
import { useModal } from '@shared/components/ModalProvider';
import { useSendCheer } from '@features/Goals/hooks/useGoalCheer';
import type { GoalBeat } from '@features/Goals/types/goals';
import type { MotivationGoal } from '@features/Home/types/home';
import { useGoalById } from '@features/Home/hooks/useGoalById';
import { FIRST_TIME_HINT_COPY } from './firstTimeHints';
import { useFirstTimeHints } from './FirstTimeHintsProvider';
import { HintArrow } from './HintArrow';

const OPEN_DELAY_MS = 800;
const CONTENT_LIFT = vs(16);

type Phase = 'hidden' | 'teach';

type Props = {
  goal: MotivationGoal | null;
};

// Beat 3: once someone has pushed, teach the next action in the same spotlight
// pattern as first push. The cheer itself still happens through the real cheer
// sheet, so completion stays tied to the real mutation.
export function SpotlightCheerDiscovery({ goal }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const { openCheerSheet } = useModal();
  const { dismissHint, markHintRendered, hasRenderedThisSession } = useFirstTimeHints();

  const [activeGoal, setActiveGoal] = useState<MotivationGoal | null>(null);
  const [phase, setPhase] = useState<Phase>('hidden');
  const closingRef = useRef(false);
  const deferredGoalIdRef = useRef<string | null>(null);
  const sendCheer = useSendCheer(activeGoal?.id ?? goal?.id ?? '');
  const feedBeat = getLatestCheerableBeat(goal?.beats);
  const needsFullGoal = Boolean(goal && !isCheerableBeat(feedBeat));
  const { data: fullGoal } = useGoalById(goal?.id ?? '', needsFullGoal);
  const resolvedGoal = (fullGoal ?? goal) as MotivationGoal | null;
  const resolvedBeat = getLatestCheerableBeat(resolvedGoal?.beats);
  const canOpenGoal =
    Boolean(resolvedGoal) &&
    isCheerableBeat(resolvedBeat) &&
    !resolvedGoal?.completed &&
    Boolean(resolvedGoal?.hasPushed);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (goal?.id !== deferredGoalIdRef.current) {
      deferredGoalIdRef.current = null;
    }
  }, [goal?.id]);

  const finishClose = useCallback(() => {
    setPhase('hidden');
    setActiveGoal(null);
    closingRef.current = false;
  }, []);

  const close = useCallback(
    (afterClose?: () => void) => {
      if (closingRef.current) return;
      closingRef.current = true;
      progress.value = withTiming(0, { duration: 220 }, finished => {
        if (!finished) return;
        runOnJS(finishClose)();
        if (afterClose) runOnJS(afterClose)();
      });
    },
    [finishClose, progress],
  );

  useEffect(() => {
    if (!resolvedGoal || !canOpenGoal || !isFocused || phase !== 'hidden') return;
    if (deferredGoalIdRef.current === resolvedGoal.id) return;
    // Shown once per session; don't re-nag on every Home refocus.
    if (hasRenderedThisSession('cheer_discovery')) return;

    const timer = setTimeout(() => {
      setActiveGoal(resolvedGoal);
      setPhase('teach');
      markHintRendered('cheer_discovery');
      progress.value = 0;
      progress.value = withDelay(50, withTiming(1, { duration: 380 }));
    }, OPEN_DELAY_MS);

    return () => clearTimeout(timer);
  }, [
    canOpenGoal,
    isFocused,
    markHintRendered,
    hasRenderedThisSession,
    phase,
    progress,
    resolvedGoal,
  ]);

  useEffect(() => {
    if (!isFocused && phase === 'teach') {
      close();
    }
  }, [isFocused, phase, close]);

  const handleSkip = useCallback(() => {
    if (phase !== 'teach') return;
    dismissHint('cheer_discovery');
    close();
  }, [phase, dismissHint, close]);

  const handleCheer = useCallback(() => {
    if (!activeGoal || phase !== 'teach') return;

    const beat = getLatestCheerableBeat(activeGoal.beats);
    if (!beat?.beatId) {
      close();
      return;
    }

    haptics.selection();
    deferredGoalIdRef.current = activeGoal.id;
    close(() => {
      openCheerSheet({
        ownerName: getFirstName(activeGoal.name || 'them'),
        taskText: stripOuterQuotes(beat.text || activeGoal.text),
        beatType: beat.type,
        onSelectPreset: presetKey =>
          new Promise<void>((resolve, reject) => {
            sendCheer.mutate(
              {
                beatId: beat.beatId,
                presetKey,
              },
              {
                onSuccess: () => resolve(),
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
    });
  }, [activeGoal, close, openCheerSheet, phase, sendCheer]);

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
  const beat = getLatestCheerableBeat(activeGoal.beats);
  const cheerCount = beat?.cheerCount ?? activeGoal.cheerTotal ?? 0;

  return (
    <Modal transparent statusBarTranslucent animationType="none" onRequestClose={handleSkip}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.scrim]}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Dismiss cheer hint"
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

            <TextElement style={styles.goalText}>
              {stripOuterQuotes(beat?.text || activeGoal.text)}
            </TextElement>

            <View style={styles.cardFooter}>
              <TextElement style={styles.pushMeta}>
                {cheerCount > 0
                  ? `${cheerCount} ${cheerCount === 1 ? 'cheer' : 'cheers'} so far`
                  : 'No cheers yet'}
              </TextElement>
              <Ripple radius={24} onPress={handleCheer} style={styles.cheerButton}>
                <Icon
                  set="fa6"
                  name="bolt"
                  iconStyle="solid"
                  size={ms(13)}
                  color={colors.tactileMomentumSecondary}
                />
                <TextElement style={styles.cheerButtonText}>Cheer</TextElement>
              </Ripple>
            </View>
          </View>

          <HintArrow style={styles.arrow} />

          <View style={styles.copyBlock}>
            <TextElement style={styles.copyText}>
              {FIRST_TIME_HINT_COPY.cheer_discovery.copy}
            </TextElement>
            <View style={styles.copyAccent} />
            <Pressable
              onPress={handleSkip}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Skip cheer hint"
            >
              <TextElement style={styles.skipText}>Skip</TextElement>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function getLatestCheerableBeat(beats?: GoalBeat[]): GoalBeat | null {
  if (!beats?.length) return null;

  return (
    beats.find(beat => beat?.isLatest) ??
    [...beats].filter(Boolean).sort((a, b) => {
      const bTime = new Date(b.createdAt).getTime();
      const aTime = new Date(a.createdAt).getTime();
      return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
    })[0] ??
    null
  );
}

function isCheerableBeat(beat?: GoalBeat | null): beat is GoalBeat {
  return Boolean(beat?.beatId && !beat.callerHasCheered && beat.isCheeringOpen !== false);
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
      gap: spacing.sm,
    },
    pushMeta: {
      flex: 1,
      fontSize: ms(13),
      color: colors.onboardingMuted,
    },
    cheerButton: {
      minHeight: vs(34),
      paddingHorizontal: ms(16),
      borderRadius: ms(24),
      backgroundColor: colors.onboardingPush,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ms(7),
    },
    cheerButtonText: {
      fontSize: ms(14),
      lineHeight: ms(18),
      fontWeight: '800',
      color: colors.tactileMomentumSecondary,
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
