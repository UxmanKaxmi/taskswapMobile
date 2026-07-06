import { api, type CustomAxiosRequestConfig } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import type { BlockedUser, BlockUserPayload, ReportTaskPayload } from '../types/report.types';

export async function reportTask({
  taskId,
  reason,
  reportedUserId,
}: ReportTaskPayload): Promise<void> {
  await api.post(
    buildRoute.reportTask(taskId),
    {
      reason,
      reportedUserId,
    },
    {
      skipToast: true,
      skipErrorLog: true,
    } as CustomAxiosRequestConfig,
  );
}

export async function blockUser({ userId }: BlockUserPayload): Promise<void> {
  await api.post(buildRoute.blockUser(userId));
}

export async function unblockUser({ userId }: BlockUserPayload): Promise<void> {
  await api.delete(buildRoute.blockUser(userId));
}

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  const response = await api.get<BlockedUser[]>(buildRoute.blockedUsers());
  return response.data;
}
