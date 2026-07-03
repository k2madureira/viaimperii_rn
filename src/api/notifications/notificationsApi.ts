import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FeedAuthor } from '../feed/feedApi';

export type NotificationType =
  | 'feed_comment'
  | 'feed_reaction'
  | 'feed_mention'
  | 'mission_approved'
  | 'mission_rejected'
  | 'mission_finalized'
  | 'rank_up'
  | 'medal_earned'
  | 'new_follower';

export interface NotificationItem {
  id: number;
  type: NotificationType | string;
  payload: Record<string, any>;
  // Outro usuário envolvido na notificação, resolvido ao vivo pelo backend
  // (nome/avatar/patente atuais — nunca vem congelado no payload). Null para
  // conquistas do próprio usuário (mission_finalized, rank_up, medal_earned).
  actor: FeedAuthor | null;
  read: boolean;
  created_at: string;
}

export interface NotificationsListResponse {
  items: NotificationItem[];
  nextCursor: number | null;
}

export interface UnreadCountResponse {
  count: number;
}

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

export async function getUnreadNotificationsCount(): Promise<UnreadCountResponse> {
  const response = await apiFetch('/notifications/unread-count');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar notificações não lidas'));
  }

  return readContent<UnreadCountResponse>(response);
}

export async function markNotificationRead(notificationId: number): Promise<NotificationItem> {
  const response = await apiFetch(`/notifications/${notificationId}/read`, { method: 'PATCH' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao marcar notificação como lida'));
  }

  return readContent<NotificationItem>(response);
}

export async function markAllNotificationsRead(): Promise<UnreadCountResponse> {
  const response = await apiFetch('/notifications/read-all', { method: 'PATCH' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao marcar notificações como lidas'));
  }

  return readContent<UnreadCountResponse>(response);
}
