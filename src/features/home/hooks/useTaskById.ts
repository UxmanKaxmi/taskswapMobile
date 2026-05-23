import { useQuery } from '@tanstack/react-query';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { getTaskByIdAPI } from '../api/api';

export function useTaskById(taskId: string) {
  return useQuery({
    queryKey: buildQueryKey.taskById(taskId),
    queryFn: () =>
      getTaskByIdAPI(taskId, {
        skipToast: true,
        skipAuthLogout: true,
      }),
    enabled: !!taskId,
    staleTime: 0, // ✅ force re-fetch on invalidation
  });
}
