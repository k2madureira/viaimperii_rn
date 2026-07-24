import { apiFetch, readContent, readError } from '../config/defaultApi';
import { NotificationItem } from './dto';

export async function markNotificationRead(notificationId: number): Promise<NotificationItem> {
  const response = await apiFetch(`/notifications/${notificationId}/read`, { method: 'PATCH' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao marcar notificação como lida'));
  }

  return readContent<NotificationItem>(response);
}
