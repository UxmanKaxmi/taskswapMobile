import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import { ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import TextElement from '../TextElement/TextElement';
import TickMark from '../TickMark';

type PushTicksProps = {
  count: number;
  animateNonce?: React.Key;
  isActive?: boolean;
  replayOnNonceChange?: boolean;
  showCount?: boolean;
  style?: StyleProp<ViewStyle>;
};

type TickMarkType = 'normal' | 'accent' | 'major';

export default function PushTicks({
  count,
  animateNonce,
  isActive = true,
  replayOnNonceChange = true,
  showCount = false,
  style,
}: PushTicksProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const marks = useMemo(() => buildMarks(count), [count]);
  const animatedValues = useRef<Animated.Value[]>([]);
  const previousLengthRef = useRef(0);
  const previousNonceRef = useRef<React.Key | undefined>(animateNonce);
  const hasAnimatedRef = useRef(false);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    animatedValues.current = marks.map(
      (_, index) => animatedValues.current[index] ?? new Animated.Value(0),
    );

    animatedValues.current = animatedValues.current.slice(0, marks.length);
  }, [marks.length]);

  useEffect(() => {
    if (!marks.length) {
      previousLengthRef.current = 0;
      previousNonceRef.current = animateNonce;
      hasAnimatedRef.current = false;
      setDisplayCount(0);
      return;
    }

    if (!isActive) {
      animatedValues.current.forEach(value => {
        value.stopAnimation();
        value.setValue(0);
      });
      previousLengthRef.current = 0;
      previousNonceRef.current = animateNonce;
      hasAnimatedRef.current = false;
      setDisplayCount(0);
      return;
    }

    const previousLength = previousLengthRef.current;
    const nonceChanged = previousNonceRef.current !== animateNonce;
    const shouldReplayAll =
      !hasAnimatedRef.current ||
      (replayOnNonceChange && nonceChanged && previousLength === marks.length);

    if (!shouldReplayAll && marks.length <= previousLength) {
      animatedValues.current.forEach(value => {
        value.stopAnimation();
        value.setValue(1);
      });
      previousLengthRef.current = marks.length;
      previousNonceRef.current = animateNonce;
      hasAnimatedRef.current = true;
      setDisplayCount(marks.length);
      return;
    }

    const startIndex = shouldReplayAll ? 0 : Math.min(previousLength, marks.length);

    animatedValues.current.forEach((value, index) => {
      value.stopAnimation();
      value.setValue(index < startIndex ? 1 : 0);
    });

    setDisplayCount(startIndex);

    const animations = marks.slice(startIndex).map((_, offset) => {
      const index = startIndex + offset;

      return Animated.timing(animatedValues.current[index], {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      });
    });

    Animated.stagger(120, animations).start();

    const timers = marks.slice(startIndex).map((_, offset) => {
      const index = startIndex + offset;

      return setTimeout(() => {
        setDisplayCount(index + 1);
      }, offset * 120);
    });

    previousLengthRef.current = marks.length;
    previousNonceRef.current = animateNonce;
    hasAnimatedRef.current = true;

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isActive, animateNonce, marks.length, replayOnNonceChange]);

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
                  {
                    height: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, getTickHeight(mark)],
                    }),
                    opacity: animatedValue,
                  },
                ]}
              >
                <TickMark color={getTickColor(mark, colors)} height={getTickHeight(mark)} />
              </Animated.View>
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

function buildMarks(count: number): TickMarkType[] {
  const safeCount = Math.max(0, Math.floor(count));
  const visibleCount = Math.min(safeCount, 24);

  return Array.from({ length: visibleCount }, (_, index) => {
    const tickNumber = index + 1;

    if (tickNumber % 13 === 0) return 'major';
    if (tickNumber % 5 === 0) return 'accent';

    return 'normal';
  });
}

function getTickHeight(mark: TickMarkType) {
  switch (mark) {
    case 'major':
      return ms(16);
    case 'accent':
      return ms(15);
    case 'normal':
    default:
      return ms(12);
  }
}

function getTickColor(mark: TickMarkType, colors: ThemeColors) {
  switch (mark) {
    case 'major':
    case 'accent':
      return colors.onboardingPush;
    case 'normal':
    default:
      return colors.onboardingInk;
  }
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      minHeight: ms(18),
    },

    tickSlot: {
      width: ms(5),
      justifyContent: 'flex-end',
      alignItems: 'center',
    },

    tickGap: {
      marginRight: ms(1.5),
    },

    tickBase: {
      overflow: 'hidden',
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
