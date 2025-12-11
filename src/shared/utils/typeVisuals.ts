// src/shared/utils/typeVisuals.ts

import { TaskType } from '@features/Tasks/types/tasks';
import { colors } from '@shared/theme';

export type TaskCategoryType =
  | 'reminder'
  | 'decision'
  | 'decision-done'
  | 'motivation'
  | 'advice'
  | 'follow'
  | 'comment'
  | 'task';

// -------- EMOJIS ONLY (NO COLORS HERE) --------
export const typeEmojis: Record<TaskCategoryType, string> = {
  reminder: '🔔',
  decision: '⚖️',
  'decision-done': '✅',
  motivation: '💡',
  advice: '💬',
  follow: '➕',
  comment: '💬',
  task: '📝',
};

// Cleaner getVisual function
export function getTypeVisual(type: string) {
  return {
    emoji: typeEmojis[type as TaskCategoryType] ?? '🔔',
    color: typeBackgrounds[type as TaskType] ?? '#9E9E9E',
  };
}

// -------- SINGLE COLOR SOURCE --------
// All colors come from your theme system now
export const typeBackgrounds: Record<TaskType, string> = {
  reminder: colors.reminderBg,
  decision: colors.decisionBg,
  motivation: colors.motivationBg,
  advice: colors.adviceBg,
};

export const typeBackgroundsHard: Record<TaskType, string> = {
  reminder: colors.reminderBgHard,
  decision: colors.decisionBgHard,
  motivation: colors.motivationBgHard,
  advice: colors.adviceBgHard,
};

// Icons remain unchanged
export const typeIcons: Record<TaskType, string> = {
  reminder: 'bell',
  decision: 'scale-unbalanced',
  motivation: 'lightbulb',
  advice: 'message',
};
