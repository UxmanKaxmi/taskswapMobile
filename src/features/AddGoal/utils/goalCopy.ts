import { GoalType } from '@features/Goals/types/goals';

export function getTitle(_type: GoalType): string {
  return 'What do you need help starting today?';
}

export function getSubtitle(_type: GoalType): string {
  return 'Be specific. Say what you want to do and why it feels hard.';
}

export function getGoalPlaceholder(_type: GoalType): string {
  return 'e.g. "I want to work out, but I keep putting it off."';
}

export function getGoalHints(_type: GoalType): string {
  return 'No pressure. Say it as it is.';
}

export function getHelperHints(_type: GoalType): string {
  return 'Invite someone who keeps you accountable.';
}

export function getVisibilityHelperText(
  visibility: 'public' | 'friends' | 'private',
  _type: GoalType,
): string {
  switch (visibility) {
    case 'public':
      return 'Others can see this and help keep you going.';

    case 'friends':
      return 'Only your friends can see this.';

    case 'private':
      return 'Only you can see this.';
  }
}

export function getButtonText(_type: GoalType): string {
  return 'Ask for Motivation';
}
