// GoalThemeContainer.tsx
import React, { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GoalType } from '@features/Goals/types/goals';
import { useTheme } from '@shared/theme';

type Props = PropsWithChildren<{
  type: GoalType;
}>;

export function GoalThemeContainer({ type, children }: Props) {
  const { colors } = useTheme();

  const gradients: Record<GoalType, string[]> = {
    motivation: [colors.motivationIconBackground, colors.motivationBg],
    advice: [colors.adviceIconBackground, colors.adviceBg],
    decision: [colors.decisionIconBackground, colors.decisionBg],
    reminder: [colors.reminderIconBackground, colors.reminderBg],
  };

  return (
    <LinearGradient
      colors={gradients[type]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFill} // 🔥 THIS IS THE FIX
    >
      {children}
    </LinearGradient>
  );
}
