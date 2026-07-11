import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@shared/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// One dash cycle (dot + gap): the offset animates by exactly one cycle per
// loop so the dot march is seamless.
const DOT = 0.1;
const GAP = 9;
const CYCLE = DOT + GAP;
const LOOP_MS = 900;

type HintArrowProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  // Mirror the arc horizontally for CTAs sitting on the left.
  flip?: boolean;
  // Mirror vertically for CTAs sitting below the copy (e.g. the bottom FAB).
  pointDown?: boolean;
};

// Hand-drawn dotted arc pointing up-right at a spotlight CTA, with the dots
// flowing toward the arrowhead.
export function HintArrow({ size = 72, style, flip = false, pointDown = false }: HintArrowProps) {
  const { colors } = useTheme();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withRepeat(withTiming(1, { duration: LOOP_MS, easing: Easing.linear }), -1);
  }, [t]);

  const animatedProps = useAnimatedProps(() => ({
    // Negative offset marches the dots from tail to arrowhead.
    strokeDashoffset: -t.value * CYCLE,
  }));

  const mirror: ViewStyle = {
    transform: [{ scaleX: flip ? -1 : 1 }, { scaleY: pointDown ? -1 : 1 }],
  };

  return (
    <Svg
      width={size}
      height={size * 0.82}
      viewBox="0 0 64 52"
      style={[mirror, style]}
      pointerEvents="none"
    >
      <AnimatedPath
        d="M 8 46 Q 40 44 52 14"
        stroke={colors.onboardingPush}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${DOT} ${GAP}`}
        animatedProps={animatedProps}
      />
      {/* Chevron arms straddle the arc's end tangent so head and line read
          as one stroke. */}
      <Path
        d="M 52.5 26 L 52 14 L 43.5 22.5"
        stroke={colors.onboardingPush}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
