import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import TickMark from '@shared/components/TickMark';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_TICKS = 12;

type Props = {
  createdAt?: string;
  pushCount: number;
  // Circle detail reuses these stat boxes with its own wording
  // ("pushes across the circle" instead of "pushes received").
  pushesLabel?: string;
};

export default function MotivationStatsHeader({
  createdAt,
  pushCount,
  pushesLabel = 'pushes received',
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const dayCount = React.useMemo(() => {
    const created = new Date(createdAt ?? '').getTime();
    if (!Number.isFinite(created)) return 1;
    return Math.max(1, Math.floor((Date.now() - created) / DAY_MS) + 1);
  }, [createdAt]);

  // One tick per push (capped). The newest tick pops in when a push lands.
  const tickCount = Math.min(Math.max(pushCount, 0), MAX_TICKS);

  const popAnim = useRef(new Animated.Value(1)).current;
  const prevPushCount = useRef(pushCount);

  useEffect(() => {
    if (pushCount > prevPushCount.current) {
      popAnim.setValue(0);
      Animated.spring(popAnim, {
        toValue: 1,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }).start();
    }
    prevPushCount.current = pushCount;
  }, [pushCount, popAnim]);

  return (
    <View>
      {/* Stat boxes */}
      <View style={styles.boxesRow}>
        <View style={[styles.box, styles.boxDark]}>
          <TextElement style={[styles.boxValue, styles.boxValueDark]}>{pushCount}</TextElement>
          <TextElement style={[styles.boxLabel, styles.boxLabelDark]}>{pushesLabel}</TextElement>
        </View>

        <View style={[styles.box, styles.boxLight]}>
          <TextElement style={styles.boxValue}>{dayCount}</TextElement>
          <TextElement style={styles.boxLabel}>
            {dayCount === 1 ? 'day on it' : 'days on it'}
          </TextElement>
        </View>
      </View>

      {/* One tick per push; the newest pops in when a push lands */}
      {tickCount > 0 && (
        <View style={styles.ticksRow}>
          {Array.from({ length: tickCount }).map((_, index) => {
            const isLast = index === tickCount - 1;
            const color = isLast ? colors.onboardingPush : colors.onboardingInk;

            if (isLast) {
              return (
                <Animated.View
                  key={index}
                  style={[styles.tick, { opacity: popAnim, transform: [{ scale: popAnim }] }]}
                >
                  <TickMark width={ms(8)} color={color} height={vs(14)} />
                </Animated.View>
              );
            }

            return (
              <View key={index} style={styles.tick}>
                <TickMark width={ms(8)} color={color} height={vs(14)} />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    boxesRow: {
      flexDirection: 'row',
      gap: ms(12),
    },
    box: {
      flex: 1,
      minHeight: vs(64),
      borderRadius: 20,
      paddingHorizontal: spacing.md,
      paddingVertical: vs(11),
      justifyContent: 'space-between',
    },
    boxDark: {
      backgroundColor: colors.inkSurface,
    },
    boxLight: {
      backgroundColor: colors.onboardingCard,
    },
    boxValue: {
      fontSize: ms(30),
      lineHeight: ms(32),
      fontWeight: '800',
      color: colors.onboardingInk,
    },
    boxValueDark: {
      color: colors.onPrimary,
    },
    boxLabel: {
      marginTop: vs(0),
      fontSize: ms(12),
      fontWeight: '500',
      color: colors.onboardingMuted,
    },
    boxLabelDark: {
      color: 'rgba(255, 255, 255, 0.72)',
    },
    ticksRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: vs(12),
    },
    tick: {
      width: ms(5),
      height: vs(14),
      marginRight: ms(4),
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
  });
