import { useAuth } from '@features/Auth/AuthProvider';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { sendReminderNoteAPI } from '../api/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@shared/utils/toast';

export function useAddReminder(taskId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (message: string) => sendReminderNoteAPI(taskId, message),

    onSuccess: () => {
      if (!user?.id) return;

      queryClient.invalidateQueries({
        queryKey: buildQueryKey.remindersForTask(taskId),
      });

      queryClient.invalidateQueries({
        queryKey: buildQueryKey.taskById(taskId),
      });

      // ✅ CRITICAL FIX
      queryClient.invalidateQueries({
        queryKey: buildQueryKey.tasks(user.id),
      });
    },

    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to send reminder.';
      showToast({ title: 'Error', message, type: 'error' });
    },
  });
}
