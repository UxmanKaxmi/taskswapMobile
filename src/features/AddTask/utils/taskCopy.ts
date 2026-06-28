import { TaskType } from '@features/Tasks/types/tasks';

export function getTitle(type: TaskType): string {
  switch (type) {
    case 'motivation':
      return 'What do you need help starting today?';

    case 'reminder':
      return 'What do you want to be reminded about?';

    case 'decision':
      return 'What are you trying to decide?';

    case 'advice':
      return 'What do you want advice on?';

    default:
      return 'What do you need help with?';
  }
}

export function getSubtitle(type: TaskType): string {
  switch (type) {
    case 'motivation':
      return 'Be specific. Say what you want to do and why it feels hard.';

    case 'reminder':
      return 'Say what you need to remember and when it matters.';

    case 'decision':
      return 'Share the choice you are stuck on and what makes it hard to decide.';

    case 'advice':
      return 'Explain what you are dealing with so people can give thoughtful advice.';

    default:
      return '';
  }
}

export function getTaskPlaceholder(type: TaskType): string {
  switch (type) {
    case 'motivation':
      return 'e.g. "I want to work out, but I keep putting it off."';

    case 'reminder':
      return (
        'e.g. Renew car insurance on Friday at 6 PM. ' + '\n\n' + 'e.g. Call mom on Friday at 12 AM'
      );

    case 'decision':
      return 'e.g. Should I accept the new job offer?';
    // +
    // '\n\n' +
    // 'Pros: better pay\nCons: longer commute'

    case 'advice':
      return (
        'e.g. I keep starting habits but lose motivation after a week.' +
        '\n\n' +
        'How do you stay consistent?'
      );

    default:
      return 'Write your push...';
  }
}

export function getTaskHints(type: TaskType): string {
  switch (type) {
    case 'motivation':
      return 'No pressure. Say it as it is.';

    case 'reminder':
      return 'Add a few details to make it easier later.';

    case 'decision':
      return 'Share your options.';

    case 'advice':
      return 'This is a safe space. Be honest.';

    default:
      return 'No pressure. Say it as it is.';
  }
}
export function getHelperHints(type: TaskType): string {
  switch (type) {
    case 'motivation':
      return 'Invite someone who keeps you accountable.';

    case 'reminder':
      return 'Invite someone who can remind you or keep you on track.';

    case 'decision':
      return 'Invite someone whose opinion you trust.';

    case 'advice':
      return 'Invite someone who gives thoughtful advice.';

    default:
      return 'Invite someone you trust.';
  }
}

export function getVisibilityHelperText(
  visibility: 'public' | 'friends' | 'private',
  type: TaskType,
): string {
  switch (visibility) {
    case 'public':
      return type === 'motivation'
        ? 'Others can see this and help keep you going.'
        : 'Anyone can see this.';

    case 'friends':
      return 'Only your friends can see this.';

    case 'private':
      return 'Only you can see this.';
  }
}

export function getButtonText(type: TaskType): string {
  switch (type) {
    case 'motivation':
      return 'Ask for Motivation';

    case 'reminder':
      return 'Set Reminder';

    case 'decision':
      return 'Ask for a Decision';

    case 'advice':
      return 'Get Advice';

    default:
      return 'Post';
  }
}
