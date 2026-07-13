import { api } from '@shared/api/axios';
import { Goal } from '../types/goals';
import { ApiRoute, buildRoute } from '@shared/api/apiRoutes';
import { CreateGoalPayload } from '@features/AddGoal';
import type { CircleFeedCard } from '@features/Circles/types/circles.types';

export const TASK_PAGE_LIMIT = 20;

export type FeedSortKey = 'all' | 'needs_push' | 'new' | 'almost_there';

export type GoalPage = {
  data: Goal[];
  // One card per circle, first page only; present when the server has the
  // circles flag on and this client asked for them (includeCircles).
  circles?: CircleFeedCard[];
  meta: {
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type ProgressUpdate = {
  text: string;
  createdAt: string;
};

export type CreateProgressUpdateResponse = {
  progressUpdate: ProgressUpdate;
};

export async function getGoalsPage(
  cursor?: string | null,
  limit = TASK_PAGE_LIMIT,
  sort: FeedSortKey = 'needs_push',
): Promise<GoalPage> {
  const response = await api.get<GoalPage>(ApiRoute.TASKS, {
    params: {
      cursor: cursor ?? undefined,
      limit,
      sort,
      // This build renders circle cards; the server only returns them when
      // its own kill switch is on, so this is always safe to send.
      includeCircles: 1,
    },
  });
  return response.data;
}

/**
 * Update an existing task by ID.
 */
export async function updateGoal(
  id: string,
  data: Partial<Pick<CreateGoalPayload, 'text' | 'type' | 'remindAt' | 'options' | 'deliverAt'>>,
): Promise<Goal> {
  const response = await api.patch(buildRoute.task(id), data);
  return response.data;
}

export async function createGoalProgressUpdate(
  taskId: string,
  text: string,
): Promise<CreateProgressUpdateResponse> {
  const response = await api.post<CreateProgressUpdateResponse>(buildRoute.taskProgress(taskId), {
    text,
  });
  return response.data;
}

/**
 * Delete a task by ID.
 */
export async function deleteGoal(id: string): Promise<void> {
  await api.delete(buildRoute.task(id));
}

/** ---------- Votes ---------- */

export type VotePayload = {
  nextOption: string;
  prevOption?: string;
};

export async function voteOnGoal(taskId: string, payload: VotePayload) {
  // ✅ sends { nextOption, prevOption }
  const res = await api.post(buildRoute.castVote(taskId), payload);
  return res.data;
}

export async function getVotesForGoal(taskId: string) {
  const res = await api.get(buildRoute.getVotes(taskId));
  return res.data as Record<string, number>;
}

export function increaseGoalViewCount(taskId: string) {
  return api.post(buildRoute.incrementGoalViews(taskId));
}

export function fetchGoalViewCount(taskId: string) {
  return api.get(buildRoute.incrementGoalViews(taskId));
}
