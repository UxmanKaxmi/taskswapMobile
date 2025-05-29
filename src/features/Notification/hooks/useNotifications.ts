import { useQuery } from '@tanstack/react-query';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';
import { getAllNotifications } from '../api/NotificationApi';

export function useNotifications() {
  return useQuery({
    queryKey: buildQueryKey.notifications(),
    queryFn: getAllNotifications,
  });
}
