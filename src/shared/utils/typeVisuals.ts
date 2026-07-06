// src/shared/utils/typeVisuals.ts

import { GoalType, GoalTypeEnum } from '@features/Goals/types/goals';
import { ThemeColors, useTheme } from '@shared/theme';

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

// Icons remain unchanged
export const typeIcons: Record<GoalType, string> = {
  reminder: 'bell',
  decision: 'circle-dot',
  motivation: 'lightbulb',
  advice: 'message',
};

export type TypeVisuals = ReturnType<typeof buildTypeVisuals>;

// -------- SINGLE COLOR SOURCE --------
// All color-dependent visuals derive from the active palette. Components
// should use useTypeVisuals(); buildTypeVisuals is for places that already
// hold a ThemeColors object.
export function buildTypeVisuals(colors: ThemeColors) {
  const typeBackgrounds: Record<GoalType, string> = {
    reminder: colors.reminderBg,
    decision: colors.decisionBg,
    motivation: colors.motivationBg,
    advice: colors.adviceBg,
  };

  const typeBackgroundsHard: Record<GoalType, string> = {
    reminder: colors.reminderBgHard,
    decision: colors.decisionBgHard,
    motivation: colors.motivationBgHard,
    advice: colors.adviceBgHard,
  };

  const typeBackgroundsHardest: Record<GoalType, string> = {
    reminder: colors.reminderBgHardest,
    decision: colors.decisionBgHardest,
    motivation: colors.motivationBgHardest,
    advice: colors.adviceBgHardest,
  };

  const getTypeColor = (type: GoalType) => typeBackgroundsHardest[type] ?? colors.muted;

  const getTypeVisual = (type: string) => ({
    emoji: typeEmojis[type as GoalCategoryType] ?? '🔔',
    color: typeBackgrounds[type as GoalType] ?? '#9E9E9E',
  });

  const getGoalBackgroundVisual = (type: GoalType) => ({
    icon: typeIcons[type],
    color: typeBackgroundsHard[type],
  });

  // ---- IMPACT CREATION VISUALS ----
  const impactTypeVisuals: Record<
    GoalType,
    {
      title: string;
      description: string;
      icon: { set: 'fa6' | 'ion'; name: string };
      color: string;
      background: string;
    }
  > = {
    motivation: {
      title: GoalTypeEnum.Motivation,
      description: 'Get a boost when you feel stuck.',
      icon: { set: 'fa6', name: typeIcons.motivation },
      color: colors.motivationBgHardest,
      background: colors.motivationBg,
    },
    advice: {
      title: GoalTypeEnum.Advice,
      description: 'Get thoughts or guidance from others.',
      icon: { set: 'fa6', name: typeIcons.advice },
      color: colors.adviceBgHardest,
      background: colors.adviceBg,
    },
    decision: {
      title: GoalTypeEnum.Decision,
      description: 'Let others help you choose.',
      icon: { set: 'fa6', name: typeIcons.decision },
      color: colors.decisionBgHardest,
      background: colors.decisionBg,
    },
    reminder: {
      title: GoalTypeEnum.Reminder,
      description: 'A gentle nudge so you don’t forget.',
      icon: { set: 'fa6', name: typeIcons.reminder },
      color: colors.reminderBgHardest,
      background: colors.reminderBg,
    },
  };

  return {
    typeBackgrounds,
    typeBackgroundsHard,
    typeBackgroundsHardest,
    getTypeColor,
    getTypeVisual,
    getGoalBackgroundVisual,
    impactTypeVisuals,
  };
}

const visualsCache = new WeakMap<ThemeColors, TypeVisuals>();

export function useTypeVisuals(): TypeVisuals {
  const { colors } = useTheme();
  let visuals = visualsCache.get(colors);
  if (!visuals) {
    visuals = buildTypeVisuals(colors);
    visualsCache.set(colors, visuals);
  }
  return visuals;
}
