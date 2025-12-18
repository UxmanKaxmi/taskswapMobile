import { TaskType } from '@features/Tasks/types/tasks';

export function getTitle(type: TaskType): string {
  switch (type) {
    case 'motivation':
      return 'What do you need motivation for today?';

    case 'reminder':
      return 'What should we remind you about?';

    case 'decision':
      return 'What decision are you trying to make?';

    case 'advice':
      return 'What do you need advice on?';

    default:
      return 'What’s on your mind?';
  }
}

export function getTaskPlaceholder(type: TaskType): string {
  switch (type) {
    case 'motivation':
      return 'e.g. "I know I should work out, but I’m struggling to start."';

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
      return 'Tag someone who keeps you accountable.';

    case 'reminder':
      return 'Tag someone who can nudge you or keep you accountable.';

    case 'decision':
      return 'Tag people whose opinion matters to you.';

    case 'advice':
      return 'Who do you trust for advice? Tag them.';

    default:
      return 'Tag a friend whose advice you value.';
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
