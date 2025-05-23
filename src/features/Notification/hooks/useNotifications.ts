import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@shared/constants/queryKeys';
import { getAllNotifications } from '../api/NotificationApi';

export function useNotifications() {
  return useQuery({
    queryKey: [QueryKeys.Notification],
    queryFn: getAllNotifications,
  });
}
