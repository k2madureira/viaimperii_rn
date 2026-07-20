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
  | 'new_follower'
  // Votação de estandarte: proposta aberta (para todos menos o proponente) e
  // encerrada (qualquer desfecho). Sem o aviso ninguém vota e a proposta
  // expiraria por inércia — o deep-link faz parte da mecânica.
  | 'legion_standard_proposed'
  | 'legion_standard_resolved';

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
