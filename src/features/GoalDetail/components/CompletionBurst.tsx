import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ms } from 'react-native-size-matters';

import Icon from '@shared/components/Icons/Icon';
import { ThemeColors, useTheme, useThemedStyles } from '@shared/theme';

const PARTICLE_COUNT = 16;
const DURATION_MS = 850;
const HIDE_DELAY_MS = DURATION_MS + 80;

type ParticleConfig = {
  angle: number;
  distance: number;
  size: number;
  color: string;
};

type Props = {
  playKey: number;
};

export default function CompletionBurst({ playKey }: Props) {
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const particles = useMemo(() => {
    const burstColors = [
      colors.motivationBgHardest,
      colors.motivationBgHard,
      colors.motivationIconBackground,
      colors.success,
    ];
    return Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
      angle: (Math.PI * 2 * index) / PARTICLE_COUNT,
      distance: ms(32 + (index % 4) * 8),
      size: ms(4 + (index % 3)),
      color: burstColors[index % burstColors.length],
    }));
  }, [colors]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (playKey <= 0 || reduceMotion) return;

    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), HIDE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [playKey, reduceMotion]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <View style={styles.burstStage}>
        {particles.map((particle, index) => (
          <BurstParticle key={`${playKey}-${index}`} config={particle} />
        ))}

        <PulseCheck playKey={playKey} />
      </View>
    </View>
  );
}

function PulseCheck({ playKey }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [playKey, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15, 0.75, 1], [0, 1, 1, 0]),
    transform: [{ scale: interpolate(progress.value, [0, 0.18, 1], [0.84, 1.08, 1]) }],
  }));

  return (
    <Animated.View style={[styles.checkPulse, animatedStyle]}>
      <Icon set="fa6" name="circle-check" iconStyle="solid" size={ms(28)} color={colors.success} />
    </Animated.View>
  );
}

function BurstParticle({ config }: { config: ParticleConfig }) {
  const styles = useThemedStyles(createStyles);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.12, 0.72, 1], [0, 1, 0.8, 0]),
    transform: [
      { translateX: Math.cos(config.angle) * config.distance * progress.value },
      { translateY: Math.sin(config.angle) * config.distance * progress.value },
      { scale: interpolate(progress.value, [0, 0.18, 1], [0.35, 1, 0.65]) },
    ] as any,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
        },
        animatedStyle,
      ]}
    />
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20,
    },
    burstStage: {
      width: ms(120),
      height: ms(120),
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkPulse: {
      width: ms(54),
      height: ms(54),
      borderRadius: ms(27),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.motivationIconBackground,
    },
    particle: {
      position: 'absolute',
    },
  });
