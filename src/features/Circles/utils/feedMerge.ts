import type { Goal } from '@features/Goals/types/goals';
import type { FeedSortKey } from '@features/Home/components/HorizontalFilterTabs';
import type { CircleFeedCard } from '../types/circles.types';

type FeedGoal = Goal & { latestActivityAt?: string; pushCount?: number };

function circleBelongsBefore(circle: CircleFeedCard, goal: FeedGoal, sort: FeedSortKey): boolean {
  switch (sort) {
    case 'needs_push':
      // Feed ascends by push count; the circle slots in by its aggregate.
      return circle.totalPushes <= (goal.pushCount ?? 0);
    case 'almost_there':
      return circle.latestActivityAt >= (goal.latestActivityAt ?? goal.createdAt ?? '');
    case 'new':
    case 'all':
    default:
      return circle.latestActivityAt >= (goal.createdAt ?? '');
  }
}

// Circles slot into the feed wherever the active sort would naturally put
// them — never pinned to the top. Comparable keys per sort: aggregate pushes
// for "needs a push", latest circle activity for the recency sorts.
export function mergeCirclesIntoFeed(
  circles: CircleFeedCard[],
  goals: Goal[],
  sort: FeedSortKey,
): (Goal | CircleFeedCard)[] {
  if (circles.length === 0) return goals;

  const merged: (Goal | CircleFeedCard)[] = [...goals];

  // Insert in reverse so circles with equal sort keys keep the server's
  // own ranking among themselves.
  for (const circle of [...circles].reverse()) {
    const index = merged.findIndex(
      item => !('kind' in item) && circleBelongsBefore(circle, item as FeedGoal, sort),
    );

    if (index === -1) {
      merged.push(circle);
    } else {
      merged.splice(index, 0, circle);
    }
  }

  return merged;
}
