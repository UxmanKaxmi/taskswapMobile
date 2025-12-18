import { api } from '@shared/api/axios';
import { ApiRoute, buildRoute } from '@shared/api/apiRoutes';
import { CreateTaskPayload } from '@features/AddTask';
import { Task } from '@features/Tasks/types/tasks';

/**
 * Create a new task of any supported type.
 */
export async function createTask(data: CreateTaskPayload): Promise<Task> {
  const response = await api.post(ApiRoute.TASKS, data);
  return response.data;
}
