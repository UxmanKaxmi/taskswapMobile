import { useQuery } from '@tanstack/react-query';
import { getRemindersByGoalAPI } from '../api/api';
import { buildQueryKey } from '@shared/constants/queryKeys';

export function useRemindersForGoal(taskId: string) {
  return useQuery({
    queryKey: buildQueryKey.remindersForGoal(taskId),
    queryFn: () => getRemindersByGoalAPI(taskId),
    enabled: !!taskId, // ensures it doesn't run if taskId is undefined
    staleTime: 0, // ✅ required if you want it to refetch after invalidation
  });
}
