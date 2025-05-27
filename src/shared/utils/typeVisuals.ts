// src/shared/utils/typeVisuals.ts

export type TaskCategoryType =
  | 'reminder'
  | 'decision'
  | 'motivation'
  | 'advice'
  | 'follow'
  | 'comment'
  | 'task';

export type VisualInfo = {
  emoji: string;
  color: string;
};

/**
 * A mapping of task and notification types to their visual representations.
 *
 * Each type is associated with an emoji and a color to ensure consistent design
 * across task cards, type selectors, and notification UIs.
 *
 * @example
 * const visual = getTypeVisual('reminder');
 * // visual.emoji === '🕒'
 * // visual.color === '#FF9800'
 */
export const typeVisuals: Record<TaskCategoryType, VisualInfo> = {
  reminder: { emoji: '🕒', color: '#FF9800' },
  decision: { emoji: '🧠', color: '#00BCD4' },
  motivation: { emoji: '🚀', color: '#4CAF50' },
  advice: { emoji: '💡', color: '#FFC107' }, // 💡 is a yellow bulb emoji
  follow: { emoji: '➕', color: '#4CAF50' },
  comment: { emoji: '💬', color: '#2196F3' },
  task: { emoji: '📝', color: '#9C27B0' },
};

/**
 * Returns visual info (emoji + color) for a given type.
 * Falls back to a default visual if the type is not recognized.
 */
export function getTypeVisual(type: string): VisualInfo {
  return (
    typeVisuals[type as TaskCategoryType] || {
      emoji: '🔔',
      color: '#9E9E9E',
    }
  );
}
