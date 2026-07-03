import { NotificationItem } from '../../../../api/notifications/notificationsApi';

type T = (key: string, options?: Record<string, any>) => string;

// Monta a linha de texto de cada notificação a partir do `payload` (dados da
// missão/evento) + `actor` (outro usuário envolvido, resolvido ao vivo pelo
// backend — nunca lido do payload, que só guarda `from_user_id`).
export function notificationMessage(t: T, item: NotificationItem): string {
  const p = item.payload ?? {};
  const from = item.actor?.name ?? '';

  switch (item.type) {
    case 'feed_comment':
      return t('notifications.types.feed_comment', { from });
    case 'feed_reaction':
      return t('notifications.types.feed_reaction', { from });
    case 'feed_mention':
      return t('notifications.types.feed_mention', { from });
    case 'mission_approved':
      return t('notifications.types.mission_approved', {
        from,
        count: p.approvals_count ?? 0,
        required: p.approvals_required ?? 0,
      });
    case 'mission_rejected':
      return t('notifications.types.mission_rejected', { from });
    case 'mission_finalized':
      return t('notifications.types.mission_finalized', {
        name: p.mission_name ?? '',
        xp: p.xp_earned ?? 0,
      });
    case 'rank_up':
      return t('notifications.types.rank_up', { rank: p.rank_name ?? '' });
    case 'medal_earned':
      return t('notifications.types.medal_earned', { medal: p.medal ?? '' });
    case 'new_follower':
      return t('notifications.types.new_follower', { from });
    default:
      return t('notifications.types.generic');
  }
}
