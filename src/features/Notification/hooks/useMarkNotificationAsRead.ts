import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@shared/constants/queryKeys';
import { markNotificationAsReadAPI } from '../api/NotificationApi';

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsReadAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Notification] });
    },
  });
}
