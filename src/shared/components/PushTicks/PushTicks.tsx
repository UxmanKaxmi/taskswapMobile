import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import { colors } from '@shared/theme';
import TextElement from '../TextElement/TextElement';

type PushTicksProps = {
  count: number;
  animateNonce?: React.Key;
  isActive?: boolean;
  showCount?: boolean;
  style?: StyleProp<ViewStyle>;
};

type TickMark = 'normal' | 'accent' | 'major';

export default function PushTicks({
  count,
  animateNonce,
  isActive = true,
  showCount = false,
  style,
}: PushTicksProps) {
  const marks = useMemo(() => buildMarks(count), [count]);
  const animatedValues = useRef<Animated.Value[]>([]);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    animatedValues.current = marks.map(
      (_, index) => animatedValues.current[index] ?? new Animated.Value(0),
    );

    animatedValues.current = animatedValues.current.slice(0, marks.length);
  }, [marks.length]);

  useEffect(() => {
    if (!marks.length) return;

    animatedValues.current.forEach(value => {
      value.stopAnimation();
      value.setValue(0);
    });

    setDisplayCount(0);

    if (!isActive) {
      return;
    }

    const animations = marks.map((_, index) =>
      Animated.timing(animatedValues.current[index], {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    );

    Animated.stagger(120, animations).start();

    const timers = marks.map((_, index) =>
      setTimeout(() => {
        setDisplayCount(index + 1);
      }, index * 120),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive, animateNonce, marks.length]);

  if (!marks.length) return null;

  return (
    <View style={style}>
      <View style={styles.row}>
        {marks.map((mark, index) => {
          const animatedValue = animatedValues.current[index];

          if (!animatedValue) return null;

          return (
            <View
              key={`${mark}-${index}`}
              style={[styles.tickSlot, index !== marks.length - 1 && styles.tickGap]}
            >
              <Animated.View
                style={[
                  styles.tickBase,
                  getTickStyle(mark),
                  {
                    height: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, getTickHeight(mark)],
                    }),
                    opacity: animatedValue,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      {showCount && (
        <TextElement variant="label" weight="500" style={styles.pushCount}>
          <TextElement variant="label" weight="700" style={styles.pushCountStrong}>
            {displayCount}
          </TextElement>{' '}
          {displayCount === 1 ? 'push' : 'pushes'}
        </TextElement>
      )}
    </View>
  );
}

function buildMarks(count: number): TickMark[] {
  const safeCount = Math.max(0, Math.floor(count));
  const visibleCount = Math.min(safeCount, 24);

  return Array.from({ length: visibleCount }, (_, index) => {
    const tickNumber = index + 1;

    if (tickNumber % 13 === 0) return 'major';
    if (tickNumber % 5 === 0) return 'accent';

    return 'normal';
  });
}

function getTickHeight(mark: TickMark) {
  switch (mark) {
    case 'major':
      return ms(16);
    case 'accent':
      return ms(15);
    case 'normal':
    default:
      return ms(9);
  }
}

function getTickStyle(mark: TickMark) {
  switch (mark) {
    case 'major':
      return styles.tickMajor;
    case 'accent':
      return styles.tickAccent;
    case 'normal':
    default:
      return styles.tickNormal;
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: ms(18),
  },

  tickSlot: {
    width: ms(4),
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  tickGap: {
    marginRight: ms(2.2),
  },

  tickBase: {
    width: ms(3),
    borderRadius: 1,
    transform: [{ skewX: '-18deg' }],
    overflow: 'hidden',
  },

  tickNormal: {
    backgroundColor: colors.onboardingInk,
  },

  tickAccent: {
    backgroundColor: colors.onboardingPush,
  },

  tickMajor: {
    backgroundColor: colors.onboardingPush,
  },

  pushCount: {
    color: colors.onboardingMuted,
    marginTop: vs(5),
    fontSize: ms(12),
  },

  pushCountStrong: {
    color: colors.onboardingInk,
    fontSize: ms(12),
  },
});
