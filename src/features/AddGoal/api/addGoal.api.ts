import { api } from '@shared/api/axios';
import { ApiRoute, buildRoute } from '@shared/api/apiRoutes';
import { CreateGoalPayload } from '@features/AddGoal';
import { Goal } from '@features/Goals/types/goals';

/**
 * Create a new task of any supported type.
 */
export async function createGoal(data: CreateGoalPayload): Promise<Goal> {
  const response = await api.post(ApiRoute.TASKS, data);
  return response.data;
}
