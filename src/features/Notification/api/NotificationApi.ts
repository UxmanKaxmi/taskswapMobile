import { api } from '@shared/api/axios';
import { ApiRoute, buildRoute } from '@shared/api/apiRoutes';
import { NotificationDTO } from '../types/notification.types';

export async function getAllNotifications(): Promise<NotificationDTO[]> {
  const res = await api.get(buildRoute.getAllNotifications());

  console.log(res.data);
  return res.data;
}

export async function markNotificationAsReadAPI(id: string): Promise<NotificationDTO> {
  const res = await api.patch(buildRoute.markNotificationAsReadById(id));
  return res.data;
}
