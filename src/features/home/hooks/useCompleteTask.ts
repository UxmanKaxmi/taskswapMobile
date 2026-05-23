// src/features/tasks/api/useCompleteTask.ts

import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@features/Tasks/types/tasks';

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.patch(buildRoute.completeTask(taskId));
      return response.data;
    },
    onSuccess: (data, taskId) => {
      queryClient.setQueryData<Task | undefined>(buildQueryKey.taskById(taskId), current =>
        current
          ? {
              ...current,
              ...data,
              completed: true,
              completedAt: data?.completedAt ?? new Date().toISOString(),
            }
          : current,
      );
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) });
    },
  });
}
