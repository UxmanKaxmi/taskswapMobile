import { useQuery } from '@tanstack/react-query';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';
import { getAllNotifications } from '../api/NotificationApi';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '@features/Auth/AuthProvider';

export function useNotifications() {
  const { user } = useAuth();
  const isFocused = useIsFocused();

  return useQuery({
    queryKey: buildQueryKey.notifications(),
    queryFn: getAllNotifications,
    enabled: !!user && isFocused, // 🔥 Runs ONLY when logged in and focused
  });
}
