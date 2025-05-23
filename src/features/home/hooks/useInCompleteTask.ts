// src/features/tasks/api/useInCompleteTask.ts

import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useInCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.patch(buildRoute.uncompleteTask(taskId));
      return response.data;
    },
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
    },
  });
}
