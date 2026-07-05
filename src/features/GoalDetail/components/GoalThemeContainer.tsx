// GoalThemeContainer.tsx
import React, { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GoalType } from '@features/Goals/types/goals';
import { colors } from '@shared/theme';

type Props = PropsWithChildren<{
  type: GoalType;
}>;

const GRADIENTS: Record<GoalType, string[]> = {
  motivation: [colors.motivationIconBackground, colors.motivationBg],
};

export function GoalThemeContainer({ type, children }: Props) {
  return (
    <LinearGradient
      colors={GRADIENTS[type]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFill} // 🔥 THIS IS THE FIX
    >
      {children}
    </LinearGradient>
  );
}
