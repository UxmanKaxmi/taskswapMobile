import { useMutation, useQueryClient } from '@tanstack/react-query';

import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';
import { createGoalProgressUpdate } from '../api/goalApi';

export function useCreateGoalProgressUpdate(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => createGoalProgressUpdate(taskId, text),
    onSuccess: data => {
      queryClient.setQueryData(buildQueryKey.taskById(taskId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          progressUpdates: [data.progressUpdate, ...(old.progressUpdates ?? [])],
        };
      });

      queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      // Bare prefix — the summary is keyed by utc offset, so homeSummary() (no
      // offset) would not match and the refetch would never fire.
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HomeSummary] });
    },
  });
}
