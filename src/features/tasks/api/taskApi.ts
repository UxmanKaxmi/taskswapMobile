import { api } from '@shared/api/axios';
import { Task } from '../types/tasks';
import { TaskType } from '../types/tasks';

/**
 * Fetch all tasks for the authenticated user.
 */
export async function getTasks(): Promise<Task[]> {
  const response = await api.get('/tasks');
  return response.data;
}

/**
 * Payload for creating a task.
 */
export interface CreateTaskPayload {
  text: string;
  type: TaskType;
  /** Only set for reminder tasks */
  remindAt?: string;
  /** Only set for decision tasks */
  options?: string[];
  /** Only set for motivation tasks */
  deliverAt?: string;
}

/**
 * Create a new task of various types.
 * @param data the new task payload.
 * @returns the created Task.
 */
export async function createTask(data: CreateTaskPayload): Promise<Task> {
  const response = await api.post('/tasks', data);
  return response.data;
}

/**
 * Update an existing task.
 */
export async function updateTask(
  id: string,
  data: Partial<Pick<CreateTaskPayload, 'text' | 'type' | 'remindAt' | 'options' | 'deliverAt'>>,
): Promise<Task> {
  const response = await api.patch(`/tasks/${id}`, data);
  return response.data;
}

/**
 * Delete a task by ID.
 */
export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}
