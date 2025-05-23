// src/features/tasks/api/useCompleteTask.ts

import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.patch(buildRoute.completeTask(taskId));
      return response.data;
    },
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
    },
  });
}
