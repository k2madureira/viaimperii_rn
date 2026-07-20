import { FeedAuthor } from '../feed';

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
