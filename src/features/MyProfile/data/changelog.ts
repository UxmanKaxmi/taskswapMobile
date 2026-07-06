// src/features/MyProfile/data/changelog.ts
//
// Release notes shown on the Changelog ("What's New") screen and in the
// What's New launch modal. Add a new entry at the TOP of the array for every
// release you ship.
//
// Writing rules: keep every point simple enough for any user. Say what they
// can now see or do, never internals. For fixes, a friendly "squashed bugs"
// line is enough; don't describe what the bugs were.

export type ChangeType = 'new' | 'improved' | 'fixed';

export type ChangelogChange = {
  type: ChangeType;
  emoji: string;
  text: string;
};

export type ChangelogEntry = {
  /** User-facing version label, e.g. '1.0 (15)'. */
  version: string;
  /** Human-readable release date, e.g. 'Jul 6, 2026'. */
  date: string;
  /** Short headline for the release. */
  title: string;
  changes: ChangelogChange[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0 (21)',
    date: 'Jul 6, 2026',
    title: 'Your Impact & smoother goals',
    changes: [
      {
        type: 'new',
        emoji: '✨',
        text: 'Your Impact: a new page showing everyone you have helped.',
      },
      {
        type: 'improved',
        emoji: '👆',
        text: 'Managing your goals is quicker and easier.',
      },
      {
        type: 'fixed',
        emoji: '🧹',
        text: 'Squashed some bugs for a smoother experience.',
      },
    ],
  },
  {
    version: '1.0 (7)',
    date: 'Jul 6, 2026',
    title: 'Dark mode & live pushes',
    changes: [
      {
        type: 'new',
        emoji: '🌙',
        text: 'Dark mode is here. Pick Light, Dark, or match your device.',
      },
      {
        type: 'new',
        emoji: '⚡',
        text: 'See pushes and cheers from friends the moment they arrive.',
      },
      { type: 'new', emoji: '🛡️', text: 'Report and block to keep your space safe.' },
      { type: 'improved', emoji: '🚀', text: 'The whole app is faster and more stable.' },
      { type: 'fixed', emoji: '🐛', text: 'Squashed bugs for a smoother experience.' },
    ],
  },
  {
    version: '1.0 (6)',
    date: 'Jul 5, 2026',
    title: 'PushMeUp launches 🎉',
    changes: [
      {
        type: 'new',
        emoji: '🎯',
        text: 'Set goals and let friends push you to the finish line.',
      },
      { type: 'new', emoji: '🔑', text: 'Sign in with Apple or Google.' },
      { type: 'new', emoji: '🎨', text: 'A fresh look with the PushMeUp yellow.' },
    ],
  },
];

export const LATEST_RELEASE = CHANGELOG[0];
