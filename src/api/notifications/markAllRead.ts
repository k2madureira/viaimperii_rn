import { apiFetch, readContent, readError } from '../config/defaultApi';
import { UnreadCountResponse } from './dto';

export async function markAllNotificationsRead(): Promise<UnreadCountResponse> {
  const response = await apiFetch('/notifications/read-all', { method: 'PATCH' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao marcar notificações como lidas'));
  }

  return readContent<UnreadCountResponse>(response);
}
