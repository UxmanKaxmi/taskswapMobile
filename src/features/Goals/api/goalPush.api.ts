import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import { GoalPush } from '../types/goals';

/** ---------- Push (Encouragement) ---------- */

export async function toggleGoalPush(taskId: string) {
  const res = await api.post(buildRoute.toggleGoalPush(taskId));
  return res.data as GoalPush;
}

export async function getGoalPushes(taskId: string) {
  const res = await api.get(buildRoute.getGoalPushes(taskId));
  return res.data as GoalPush;
}
