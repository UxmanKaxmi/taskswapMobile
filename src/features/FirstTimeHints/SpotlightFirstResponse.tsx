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

import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import Ripple from '@shared/components/Buttons/Ripple';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { stripOuterQuotes, toShortName } from '@shared/utils/helperFunctions';
import { haptics } from '@shared/utils/haptics';
import { FIRST_TIME_HINT_COPY } from './firstTimeHints';
import { HintArrow } from './HintArrow';
import { useFirstTimeHints } from './FirstTimeHintsProvider';

const OPEN_DELAY_MS = 800;
const CONTENT_LIFT = vs(16);

type Phase = 'hidden' | 'teach';

type SpotlightTask = {
  id: string;
  text: string;
  name?: string | null;
  pushCount?: number;
};

type Props = {
  task: SpotlightTask | null;
  onShareUpdate: () => void;
};

// Beat 4: the owner has support and needs to answer with progress. The actual
// response still goes through the normal Share update sheet.
export function SpotlightFirstResponse({ task, onShareUpdate }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const { dismissHint, markHintRendered, hasRenderedThisSession } = useFirstTimeHints();

  const [activeTask, setActiveTask] = useState<SpotlightTask | null>(null);
  const [phase, setPhase] = useState<Phase>('hidden');
  const closingRef = useRef(false);
  const deferredTaskIdRef = useRef<string | null>(null);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (task?.id !== deferredTaskIdRef.current) {
      deferredTaskIdRef.current = null;
    }
  }, [task?.id]);

  const finishClose = useCallback(() => {
    setPhase('hidden');
    setActiveTask(null);
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
    // Shown once per session; don't re-nag on every screen refocus.
    if (!task || !isFocused || phase !== 'hidden' || hasRenderedThisSession('first_response'))
      return;
    if (deferredTaskIdRef.current === task.id) return;

    const timer = setTimeout(() => {
      setActiveTask(task);
      setPhase('teach');
      markHintRendered('first_response');
      progress.value = 0;
      progress.value = withDelay(50, withTiming(1, { duration: 380 }));
    }, OPEN_DELAY_MS);

    return () => clearTimeout(timer);
  }, [task, isFocused, phase, markHintRendered, hasRenderedThisSession, progress]);

  useEffect(() => {
    if (!isFocused && phase === 'teach') {
      close();
    }
  }, [isFocused, phase, close]);

  const handleSkip = useCallback(() => {
    if (phase !== 'teach') return;
    dismissHint('first_response');
    close();
  }, [phase, dismissHint, close]);

  const handleShareUpdate = useCallback(() => {
    if (!activeTask || phase !== 'teach') return;

    haptics.selection();
    deferredTaskIdRef.current = activeTask.id;
    close(onShareUpdate);
  }, [activeTask, close, onShareUpdate, phase]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const contentStyle = useAnimatedStyle(() => {
    const transform: ViewStyle['transform'] = [
      { translateY: (1 - progress.value) * CONTENT_LIFT },
      { scale: 0.96 + progress.value * 0.04 },
    ];
    return { opacity: progress.value, transform };
  });

  if (phase === 'hidden' || !activeTask) return null;

  const pushCount = activeTask.pushCount ?? 0;

  return (
    <Modal transparent statusBarTranslucent animationType="none" onRequestClose={handleSkip}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.scrim]}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Dismiss response hint"
          />
        </Animated.View>

        <Animated.View
          pointerEvents="box-none"
          style={[styles.content, { width: width - spacing.lg * 2 }, contentStyle]}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconShell}>
                <Icon
                  set="ion"
                  name="chatbubble-ellipses"
                  size={ms(18)}
                  color={colors.tactileMomentumSecondary}
                />
              </View>
              <View style={styles.identity}>
                <TextElement style={styles.name}>
                  {toShortName(activeTask.name || 'Your task')}
                </TextElement>
                <TextElement style={styles.time}>
                  {pushCount} {pushCount === 1 ? 'person has' : 'people have'} pushed you
                </TextElement>
              </View>
            </View>

            <TextElement style={styles.goalText}>{stripOuterQuotes(activeTask.text)}</TextElement>

            <View style={styles.cardFooter}>
              <TextElement style={styles.pushMeta}>Let them know what moved.</TextElement>
              <Ripple radius={24} onPress={handleShareUpdate} style={styles.updateButton}>
                <TextElement style={styles.updateButtonText}>Share update</TextElement>
              </Ripple>
            </View>
          </View>

          <HintArrow style={styles.arrow} />

          <View style={styles.copyBlock}>
            <TextElement style={styles.copyText}>
              {FIRST_TIME_HINT_COPY.first_response.copy}
            </TextElement>
            <View style={styles.copyAccent} />
            <Pressable
              onPress={handleSkip}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Skip response hint"
            >
              <TextElement style={styles.skipText}>Skip</TextElement>
            </Pressable>
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
    iconShell: {
      width: ms(40),
      height: ms(40),
      borderRadius: ms(20),
      backgroundColor: colors.onboardingPush,
      alignItems: 'center',
      justifyContent: 'center',
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
    updateButton: {
      minHeight: vs(34),
      paddingHorizontal: ms(16),
      borderRadius: ms(24),
      backgroundColor: colors.onboardingPush,
      alignItems: 'center',
      justifyContent: 'center',
    },
    updateButtonText: {
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
