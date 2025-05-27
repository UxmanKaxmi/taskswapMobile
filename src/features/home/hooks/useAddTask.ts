// src/features/tasks/api/useAddReminder.ts

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
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to send reminder.';
      showToast({ title: 'Error', message, type: 'error' });
    },
  });
}
