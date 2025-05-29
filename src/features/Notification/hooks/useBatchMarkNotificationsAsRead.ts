import { useMutation } from '@tanstack/react-query';
import { markNotificationBatch } from '../api/NotificationApi';
import { showToast } from '@shared/utils/toast';
import { queryClient } from '@lib/react-query/client';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { useNotifications } from './useNotifications';

export function useBatchMarkNotificationsAsRead() {
  const { refetch } = useNotifications();

  return useMutation<void, Error, string[]>({
    mutationFn: ids => markNotificationBatch(ids),
    onSuccess: () => {
      refetch(); // ✅ force refresh

      //   showToast({
      //     type: 'success',
      //     title: 'Notifications',
      //     message: 'Marked as read!',
      //   });
    },
    onError: () => {
      showToast({
        type: 'error',
        title: 'Notifications',
        message: 'Marked as read!',
      });
    },
  });
}
