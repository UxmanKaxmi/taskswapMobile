import { api } from '@shared/api/axios';
import { Task } from '../types/tasks';
import { ApiRoute, buildRoute } from '@shared/api/apiRoutes';
import { CreateTaskPayload } from '@features/AddTask';

export const TASK_PAGE_LIMIT = 20;

export type TaskPage = {
  data: Task[];
  meta: {
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export async function getTasksPage(
  cursor?: string | null,
  limit = TASK_PAGE_LIMIT,
): Promise<TaskPage> {
  const response = await api.get<TaskPage>(ApiRoute.TASKS, {
    params: {
      cursor: cursor ?? undefined,
      limit,
    },
  });
  return response.data;
}

/**
 * Update an existing task by ID.
 */
export async function updateTask(
  id: string,
  data: Partial<Pick<CreateTaskPayload, 'text' | 'type' | 'remindAt' | 'options' | 'deliverAt'>>,
): Promise<Task> {
  const response = await api.patch(buildRoute.task(id), data);
  return response.data;
}

/**
 * Delete a task by ID.
 */
export async function deleteTask(id: string): Promise<void> {
  await api.delete(buildRoute.task(id));
}

/** ---------- Votes ---------- */

export type VotePayload = {
  nextOption: string;
  prevOption?: string;
};

export async function voteOnTask(taskId: string, payload: VotePayload) {
  // ✅ sends { nextOption, prevOption }
  const res = await api.post(buildRoute.castVote(taskId), payload);
  return res.data;
}

export async function getVotesForTask(taskId: string) {
  const res = await api.get(buildRoute.getVotes(taskId));
  return res.data as Record<string, number>;
}

export function increaseTaskViewCount(taskId: string) {
  return api.post(buildRoute.incrementTaskViews(taskId));
}

export function fetchTaskViewCount(taskId: string) {
  return api.get(buildRoute.incrementTaskViews(taskId));
}
