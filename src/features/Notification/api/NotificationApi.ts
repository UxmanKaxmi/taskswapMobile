import { api } from '@shared/api/axios';
import { ApiRoute, buildRoute } from '@shared/api/apiRoutes';
import { NotificationDTO } from '../types/notification.types';

// ✅ Get all notifications for the user
export async function getAllNotifications(): Promise<NotificationDTO[]> {
  const res = await api.get(buildRoute.getAllNotifications());
  console.log(res.data);
  return res.data;
}

// ✅ Mark a single notification as read
export async function markNotificationAsRead(id: string): Promise<NotificationDTO> {
  const res = await api.patch(buildRoute.markNotificationAsReadById(id));
  return res.data;
}

// ✅ Send a test push notification (used for debugging)
export async function sendTestNotificationAPI(userId: string) {
  return api.post('/notification/test', {
    userId,
    title: '🔔 Debug Test',
    body: 'This is a test push notification!',
  });
}

// ✅ Mark multiple notifications as read
export async function markNotificationBatch(ids: string[]): Promise<void> {
  await api.post(buildRoute.markNotificationBatch(), { ids });
}
