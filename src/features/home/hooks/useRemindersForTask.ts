import { useQuery } from '@tanstack/react-query';
import { getRemindersByTaskAPI } from '../api/api';
import { buildQueryKey } from '@shared/constants/queryKeys';

export function useRemindersForTask(taskId: string) {
  return useQuery({
    queryKey: buildQueryKey.remindersForTask(taskId),
    queryFn: () => getRemindersByTaskAPI(taskId),
    enabled: !!taskId, // ensures it doesn't run if taskId is undefined
    staleTime: 0, // ✅ required if you want it to refetch after invalidation
  });
}
