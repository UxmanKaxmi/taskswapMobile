// src/shared/utils/typeVisuals.ts

import { TaskType, TaskTypeEnum } from '@features/Tasks/types/tasks';
import { colors } from '@shared/theme';

export type TaskCategoryType =
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
export const typeEmojis: Record<TaskCategoryType, string> = {
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
export const typeBackgroundsHardest: Record<TaskType, string> = {
  reminder: colors.reminderBgHardest,
  decision: colors.decisionBgHardest,
  motivation: colors.motivationBgHardest,
  advice: colors.adviceBgHardest,
};

// Icons remain unchanged
export const typeIcons: Record<TaskType, string> = {
  reminder: 'bell',
  decision: 'circle-dot',
  motivation: 'lightbulb',
  advice: 'message',
};

export const getTypeColor = (type: TaskType) => {
  switch (type) {
    case 'advice':
      return colors.adviceBgHardest;
    case 'reminder':
      return colors.reminderBgHardest;
    case 'motivation':
      return colors.motivationBgHardest;
    case 'decision':
      return colors.decisionBgHardest;
    default:
      return colors.muted;
  }
};

export function getTaskBackgroundVisual(type: TaskType) {
  return {
    icon: typeIcons[type],
    color: typeBackgroundsHard[type],
  };
}

// ---- IMPACT CREATION VISUALS ----

export const impactTypeVisuals: Record<
  TaskType,
  {
    title: string;
    description: string;
    icon: { set: 'fa6' | 'ion'; name: string };
    color: string;
    background: string;
  }
> = {
  motivation: {
    title: TaskTypeEnum.Motivation,
    description: 'Get a boost when you feel stuck.',
    icon: { set: 'fa6', name: typeIcons.motivation },
    color: colors.motivationBgHardest,
    background: colors.motivationBg,
  },
  advice: {
    title: TaskTypeEnum.Advice,
    description: 'Get thoughts or guidance from others.',
    icon: { set: 'fa6', name: typeIcons.advice },
    color: colors.adviceBgHardest,
    background: colors.adviceBg,
  },
  decision: {
    title: TaskTypeEnum.Decision,
    description: 'Let others help you choose.',
    icon: { set: 'fa6', name: typeIcons.decision },
    color: colors.decisionBgHardest,
    background: colors.decisionBg,
  },
  reminder: {
    title: TaskTypeEnum.Reminder,
    description: 'A gentle nudge so you don’t forget.',
    icon: { set: 'fa6', name: typeIcons.reminder },
    color: colors.reminderBgHardest,
    background: colors.reminderBg,
  },
};
