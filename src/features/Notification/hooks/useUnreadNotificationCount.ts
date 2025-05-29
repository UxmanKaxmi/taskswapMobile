import { useMemo } from 'react';
import { useNotifications } from './useNotifications';

export function useUnreadNotificationCount() {
  const { data: notifications = [], isLoading } = useNotifications();

  const count = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return { count, isLoading };
}
