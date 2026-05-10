import { useMutation, useQueryClient } from '@tanstack/react-query';

import { buildQueryKey } from '@shared/constants/queryKeys';
import { createTaskProgressUpdate } from '../api/taskApi';

export function useCreateTaskProgressUpdate(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => createTaskProgressUpdate(taskId, text),
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
      queryClient.invalidateQueries({ queryKey: buildQueryKey.homeSummary() });
    },
  });
}
