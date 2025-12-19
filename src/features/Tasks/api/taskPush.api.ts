import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import { TaskPush } from '../types/tasks';

/** ---------- Push (Encouragement) ---------- */

export async function toggleTaskPush(taskId: string) {
  const res = await api.post(buildRoute.toggleTaskPush(taskId));
  return res.data as TaskPush;
}

export async function getTaskPushes(taskId: string) {
  const res = await api.get(buildRoute.getTaskPushes(taskId));
  return res.data as TaskPush;
}
