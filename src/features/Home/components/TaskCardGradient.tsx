// src/shared/components/TaskCardGradient.tsx

import React, { PropsWithChildren } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@shared/theme';
import { TaskType } from '@features/Tasks/types/tasks';

type Props = PropsWithChildren<{
  type: TaskType;
  style?: ViewStyle;
}>;

const GRADIENTS: Record<TaskType, string[]> = {
  motivation: [
    colors.motivationIconBackground, // light top glow
    colors.motivationBg, // base
  ],
  advice: [colors.adviceIconBackground, colors.adviceBg],
  decision: [colors.decisionIconBackground, colors.decisionBg],
  reminder: [colors.reminderIconBackground, colors.reminderBg],
};

export default function TaskCardGradient({ type, children, style }: Props) {
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
