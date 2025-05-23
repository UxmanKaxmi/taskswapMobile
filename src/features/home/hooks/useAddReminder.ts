// src/features/tasks/api/useAddReminder.ts

import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendReminderNoteAPI } from '../api/api';
import { showToast } from '@shared/utils/toast';

interface AddReminderInput {
  taskId: string;
  message: string;
}

export function useAddReminder(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => sendReminderNoteAPI(taskId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildQueryKey.remindersForTask(taskId) });
      queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(taskId) }); // ✅ Add this line
      queryClient.invalidateQueries({ queryKey: buildQueryKey.tasks() });
    },
    onError: () => {
      showToast({ title: 'Error', message: 'Failed to send reminder.', type: 'error' });
    },
  });
}
