import { apiFetch, readContent, readError } from '../config/defaultApi';
import { UnreadCountResponse } from './dto';

export async function getUnreadNotificationsCount(): Promise<UnreadCountResponse> {
  const response = await apiFetch('/notifications/unread-count');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar notificações não lidas'));
  }

  return readContent<UnreadCountResponse>(response);
}
