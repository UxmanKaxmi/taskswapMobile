// src/shared/components/GoalCardGradient.tsx

import React, { PropsWithChildren } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';
import { ThemeColors, useTheme } from '@shared/theme';
import { GoalType } from '@features/Goals/types/goals';

type Props = PropsWithChildren<{
  type: GoalType;
  style?: ViewStyle;
}>;

const buildGradients = (colors: ThemeColors): Record<GoalType, string[]> => ({
  motivation: [
    colors.motivationIconBackground, // light top glow
    colors.motivationBg, // base
  ],
  advice: [colors.adviceIconBackground, colors.adviceBg],
  decision: [colors.decisionIconBackground, colors.decisionBg],
  reminder: [colors.reminderIconBackground, colors.reminderBg],
});

export default function GoalCardGradient({ type, children, style }: Props) {
  const { colors } = useTheme();
  const GRADIENTS = buildGradients(colors);
  return (
    <LinearGradient
      colors={GRADIENTS[type]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
