import { useQuery } from '@tanstack/react-query';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { getTaskByIdAPI } from '../api/api';

export function useTaskById(taskId: string, enabled = true) {
  return useQuery({
    queryKey: buildQueryKey.taskById(taskId),
    queryFn: () =>
      getTaskByIdAPI(taskId, {
        skipToast: true,
        skipAuthLogout: true,
      }),
    enabled: !!taskId && enabled,
    // Keep results fresh for a minute so the home feed's cards don't refetch
    // every time virtualization remounts them during scroll (which tanked FPS).
    // Explicit invalidateQueries(taskById) still refetches active observers
    // regardless of staleTime, so push/update flows stay correct.
    staleTime: 60_000,
  });
}
