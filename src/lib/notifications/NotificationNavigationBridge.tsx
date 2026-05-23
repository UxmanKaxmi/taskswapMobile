import { useEffect } from 'react';
import { useAuth } from '@features/Auth/AuthProvider';
import { setNotificationAuthSnapshot } from './notificationNavigation';

export default function NotificationNavigationBridge() {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    setNotificationAuthSnapshot({
      ready: !loading,
      isAuthenticated,
    });
  }, [isAuthenticated, loading]);

  return null;
}
