import type { FeatureFlags } from '@shared/featureFlags/types';

// First-time hints ("beats" in the product spec): one-time inline teaching
// moments tied to real actions. All copy lives here so it stays greppable
// and translatable. Ids are a server contract — never rename them.
export const FIRST_TIME_HINT_IDS = [
  'first_goal_posted',
  'first_push_given',
  'cheer_discovery',
  'first_response',
] as const;

export type FirstTimeHintId = (typeof FIRST_TIME_HINT_IDS)[number];

// "pending" is implicit: an id absent from the map has never been completed
// or dismissed.
export type FirstTimeHintWrittenState = 'completed' | 'dismissed';

export type FirstTimeHintEntry = {
  state: FirstTimeHintWrittenState;
  at: string;
  seeded?: boolean;
};

export type FirstTimeHintMap = Partial<Record<FirstTimeHintId, FirstTimeHintEntry>>;

export const FIRST_TIME_HINT_COPY: Record<
  FirstTimeHintId,
  {
    copy: string;
    followupCopy?: string;
    // Personalized variant for surfaces that know who was pushed.
    followupCopyFor?: (firstName?: string | null) => string;
  }
> = {
  first_goal_posted: {
    copy: 'Say it out loud. Post the thing you keep putting off.',
  },
  first_push_given: {
    copy: "Try your first push. One tap, that's all.",
    followupCopy: 'They just found out a real person has their back.',
    followupCopyFor: firstName =>
      firstName
        ? `${firstName} just found out a real person has their back.`
        : 'They just found out a real person has their back.',
  },
  cheer_discovery: {
    copy: 'Unlocked. Pushes open the door, cheers add words.',
  },
  first_response: {
    copy: "When you move, tell them. Even 'not yet' counts.",
  },
};

// Per-hint remote kill switches; the firstTimeBeats master flag gates all of
// them.
export const FIRST_TIME_HINT_FLAG_KEYS: Record<FirstTimeHintId, keyof FeatureFlags> = {
  first_goal_posted: 'hintFirstGoalPosted',
  first_push_given: 'hintFirstPushGiven',
  cheer_discovery: 'hintCheerDiscovery',
  first_response: 'hintFirstResponse',
};

// cheer_discovery retires after this many displayed renders even without a
// cheer or a dismissal. Render counts are device-local.
export const CHEER_DISCOVERY_MAX_RENDERS = 3;

export const normalizeFirstTimeHints = (value: unknown): FirstTimeHintMap => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as FirstTimeHintMap;
};

const STATE_RANK: Record<string, number> = { completed: 2, dismissed: 1 };

export const rankOfHintState = (state?: string): number => (state ? (STATE_RANK[state] ?? 0) : 0);

// Merge the server map with local state. The server wins unless local knows
// a stronger state (completed > dismissed > pending) — that means a write was
// missed; those ids come back as `unsynced` so the caller can re-send them.
export function mergeFirstTimeHints(
  local: FirstTimeHintMap,
  server: FirstTimeHintMap,
): { merged: FirstTimeHintMap; unsynced: FirstTimeHintId[] } {
  const merged: FirstTimeHintMap = { ...server };
  const unsynced: FirstTimeHintId[] = [];

  for (const hintId of FIRST_TIME_HINT_IDS) {
    const localEntry = local[hintId];
    if (localEntry && rankOfHintState(localEntry.state) > rankOfHintState(server[hintId]?.state)) {
      merged[hintId] = localEntry;
      unsynced.push(hintId);
    }
  }

  return { merged, unsynced };
}
