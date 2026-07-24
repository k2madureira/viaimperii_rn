import { apiFetch, readContent, readError } from '../config/defaultApi';
import { NotificationsListResponse } from './dto';

export async function getNotifications(
  cursor?: number | null,
  perPage = 20,
): Promise<NotificationsListResponse> {
  const parts = [`perPage=${perPage}`];
  if (cursor != null) parts.push(`cursor=${cursor}`);
  const response = await apiFetch(`/notifications?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar notificações'));
  }

  return readContent<NotificationsListResponse>(response);
}
