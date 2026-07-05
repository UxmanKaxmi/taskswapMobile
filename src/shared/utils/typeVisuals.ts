// src/shared/utils/typeVisuals.ts

import { GoalType } from '@features/Goals/types/goals';
import { colors } from '@shared/theme';

// Notification-category visuals. Legacy categories (reminder, decision, advice)
// are kept for display of old inbox items only — the goal types themselves are gone.
export type GoalCategoryType =
  | 'reminder'
  | 'decision'
  | 'decision-done'
  | 'motivation'
  | 'advice'
  | 'follow'
  | 'comment'
  | 'task'
  | 'push'
  | 'task-completed';

// -------- EMOJIS ONLY (NO COLORS HERE) --------
export const typeEmojis: Record<GoalCategoryType, string> = {
  reminder: '🔔',
  decision: '⚖️',
  'decision-done': '✅',
  motivation: '💡',
  advice: '💬',
  follow: '👤',
  comment: '💬',
  task: '📝',
  push: '⚡',
  'task-completed': '✅',
};

// Cleaner getVisual function
export function getTypeVisual(type: string) {
  return {
    emoji: typeEmojis[type as GoalCategoryType] ?? '💡',
    color: typeBackgrounds[type as GoalType] ?? colors.motivationBg,
  };
}

// -------- SINGLE COLOR SOURCE --------
// All colors come from your theme system now
export const typeBackgrounds: Record<GoalType, string> = {
  motivation: colors.motivationBg,
};

export const typeBackgroundsHard: Record<GoalType, string> = {
  motivation: colors.motivationBgHard,
};
export const typeBackgroundsHardest: Record<GoalType, string> = {
  motivation: colors.motivationBgHardest,
};

// Icons remain unchanged
export const typeIcons: Record<GoalType, string> = {
  motivation: 'lightbulb',
};

export const getTypeColor = (type: GoalType) => {
  switch (type) {
    case 'motivation':
      return colors.motivationBgHardest;
    default:
      return colors.muted;
  }
};

export function getGoalBackgroundVisual(type: GoalType) {
  return {
    icon: typeIcons[type] ?? typeIcons.motivation,
    color: typeBackgroundsHard[type] ?? typeBackgroundsHard.motivation,
  };
}
