import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Ripple from '@shared/components/Buttons/Ripple';
import { platformShadow, spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import { navigationRef } from '@navigation/navigationRef';
import { useAuth } from '@features/Auth/AuthProvider';
import { haptics } from '@shared/utils/haptics';
import { isAndroid } from '@shared/utils/constants';
import { FIRST_TIME_HINT_COPY } from './firstTimeHints';
import { useFirstTimeHints } from './FirstTimeHintsProvider';
import { HintArrow } from './HintArrow';

const OPEN_DELAY_MS = 800;
const CONTENT_LIFT = vs(16);
// Mirrors the real add button closely enough that our replica reads as that
// button lit up over the scrim. Android: the raised 70×70 center FAB in the
// tab bar. iOS: the detached native "search-role" tab item — a smaller
// circle on the RIGHT end of the bottom bar.
const FAB_SIZE = isAndroid ? 70 : 64;
const FAB_BOTTOM_OFFSET = isAndroid ? vs(16) : vs(6);

type Phase = 'hidden' | 'teach';

type Props = {
  // True when the first_goal_posted hint won the feed spotlight election.
  show: boolean;
};

// The "+" spotlight: the app dims and the bottom add-goal button stays lit
// (a replica over the scrim, at the FAB's position), with the copy and a
// down arrow pointing at it. The tap is the real entry into the composer —
// guests hit the auth gate on the same tap. Completion rides the
// create-goal mutation, never the tap.
export function SpotlightFirstGoal({ show }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const { user } = useAuth();
  const { dismissHint, markHintRendered, hasRenderedThisSession } = useFirstTimeHints();

  const [phase, setPhase] = useState<Phase>('hidden');
  const closingRef = useRef(false);

  const progress = useSharedValue(0);

  const finishClose = useCallback(() => {
    setPhase('hidden');
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
    // Already shown this session (e.g. opened the composer and backed out):
    // don't re-nag on refocus — wait for the next app launch.
    if (!show || !isFocused || phase !== 'hidden' || hasRenderedThisSession('first_goal_posted'))
      return;

    const timer = setTimeout(() => {
      setPhase('teach');
      markHintRendered('first_goal_posted');
      progress.value = 0;
      progress.value = withDelay(50, withTiming(1, { duration: 380 }));
    }, OPEN_DELAY_MS);

    return () => clearTimeout(timer);
  }, [show, isFocused, phase, markHintRendered, hasRenderedThisSession, progress]);

  // Leaving the screen mid-teach closes silently: the hint stays pending.
  useEffect(() => {
    if (!isFocused && phase === 'teach') {
      close();
    }
  }, [isFocused, phase, close]);

  const handleSkip = useCallback(() => {
    if (phase !== 'teach') return;
    dismissHint('first_goal_posted');
    close();
  }, [phase, dismissHint, close]);

  const handleCompose = useCallback(() => {
    if (phase !== 'teach') return;
    haptics.selection();
    // Close first so the composer (or the auth gate) never opens underneath
    // this modal. The hint stays pending until the goal is actually posted.
    close(() => {
      if (!user) {
        // Same gate + redirect as the real + tab button.
        checkAuthThenNavigate('AddGoal');
        return;
      }
      // Open the composer at the ROOT level so the bottom tab bar is not
      // visible — navigating 'AddGoal' from inside the tab navigator would
      // select the AddGoal TAB instead and keep the bar on screen.
      if (navigationRef.isReady()) {
        navigationRef.navigate('AddGoalScreen', { screen: 'AddMotivation' });
      }
    });
  }, [phase, close, user, checkAuthThenNavigate]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const contentStyle = useAnimatedStyle(() => {
    const transform: ViewStyle['transform'] = [{ translateY: (1 - progress.value) * CONTENT_LIFT }];
    return { opacity: progress.value, transform };
  });

  if (phase === 'hidden') return null;

  return (
    <Modal transparent statusBarTranslucent animationType="none" onRequestClose={handleSkip}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.scrim]}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Dismiss first goal hint"
          />
        </Animated.View>

        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.bottomStack,
            { paddingBottom: insets.bottom + FAB_BOTTOM_OFFSET },
            contentStyle,
          ]}
        >
          <View style={styles.copyBlock}>
            <TextElement style={styles.copyText}>
              {FIRST_TIME_HINT_COPY.first_goal_posted.copy}
            </TextElement>
            <View style={styles.copyAccent} />
            <Pressable
              onPress={handleSkip}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Skip first goal hint"
            >
              <TextElement style={styles.skipText}>Skip</TextElement>
            </Pressable>
          </View>

          <HintArrow pointDown size={64} style={styles.arrow} />

          {/* Ripple applies `style` to an inner view, so alignment must live
              on this wrapper row, not on the button itself. */}
          <View style={styles.fabRow}>
            <Ripple radius={FAB_SIZE / 2} onPress={handleCompose} style={styles.fab}>
              <Icon
                set="fa6"
                name="plus"
                iconStyle="solid"
                size={isAndroid ? ms(24) : ms(20)}
                color={colors.tactileMomentumSecondary}
              />
            </Ripple>
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
      justifyContent: 'flex-end',
    },
    scrim: {
      backgroundColor: 'rgba(8, 9, 14, 0.86)',
    },
    bottomStack: {
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    copyBlock: {
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
    // Points down at the add button; the flipped arc's tip is at its
    // bottom-right corner. Android: button is centered, so the arrow sits
    // left of center. iOS: button is at the right edge, so the arrow trails
    // to its left.
    arrow: isAndroid
      ? {
          alignSelf: 'center',
          marginRight: ms(72),
          marginTop: vs(8),
          marginBottom: vs(2),
        }
      : {
          alignSelf: 'flex-end',
          marginRight: ms(56),
          marginTop: vs(8),
          marginBottom: vs(2),
        },
    fabRow: {
      alignSelf: 'stretch',
      alignItems: isAndroid ? 'center' : 'flex-end',
      marginRight: isAndroid ? 0 : -ms(6),
    },
    fab: {
      width: FAB_SIZE,
      height: FAB_SIZE,
      borderRadius: FAB_SIZE / 2,
      backgroundColor: colors.tactileMomentumPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      ...platformShadow({
        color: colors.tactileMomentumPrimary,
        opacity: 0.3,
        radius: 4,
        offset: { width: 0, height: 4 },
      }),
    },
  });
