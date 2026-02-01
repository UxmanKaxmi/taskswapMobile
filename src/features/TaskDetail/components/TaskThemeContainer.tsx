// TaskThemeContainer.tsx
import React, { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { TaskType } from '@features/Tasks/types/tasks';
import { colors } from '@shared/theme';

type Props = PropsWithChildren<{
  type: TaskType;
}>;

const GRADIENTS: Record<TaskType, string[]> = {
  motivation: [colors.motivationIconBackground, colors.motivationBg],
  advice: [colors.adviceIconBackground, colors.adviceBg],
  decision: [colors.decisionIconBackground, colors.decisionBg],
  reminder: [colors.reminderIconBackground, colors.reminderBg],
};

export function TaskThemeContainer({ type, children }: Props) {
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
