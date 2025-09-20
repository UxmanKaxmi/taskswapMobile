import { api } from '@shared/api/axios';
import { Task, TaskType } from '../types/tasks';
import { ApiRoute, buildRoute } from '@shared/api/apiRoutes';

/**
 * Fetch all tasks for the authenticated user.
 */
export async function getTasks(): Promise<Task[]> {
  const response = await api.get(ApiRoute.TASKS);
  return response.data;
}

/**
 * Payload for creating a task.
 */
export interface CreateTaskPayload {
  text: string;
  type: TaskType;
  remindAt?: string; // For reminder tasks
  options?: string[]; // For decision tasks
  deliverAt?: string | null; // For motivation tasks
  helperIds?: string[]; // IDs of users to assign as helpers
}

/**
 * Create a new task of any supported type.
 */
export async function createTask(data: CreateTaskPayload): Promise<Task> {
  const response = await api.post(ApiRoute.TASKS, data);
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
