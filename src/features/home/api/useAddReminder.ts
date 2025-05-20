// src/features/tasks/api/useAddReminder.ts

import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AddReminderInput {
  taskId: string;
  message: string;
}

async function addReminder({ taskId, message }: AddReminderInput) {
  const response = await api.post(buildRoute.sendReminder(taskId), { message });
  return response.data;
}

export function useAddReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addReminder,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.remindersForTask(variables.taskId) });
    },
  });
}
