import { useEffect, useRef } from 'react';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import {
  connectNotificationEvents,
  NotificationSSEEvent,
} from '../../../../api/notifications/notificationEvents';
import {
  NotificationItem,
  NotificationsListResponse,
  UnreadCountResponse,
} from '../../../../api/notifications/notificationsApi';

type NotificationsCache = InfiniteData<NotificationsListResponse>;

/**
 * Mantém uma conexão SSE persistente com GET /notifications/events?token=<token>.
 *
 * `notification_new`: chega com `actor` já resolvido — insere no topo do cache
 * da lista (sem refetch) e incrementa o badge de não lidas. Se o app estiver em
 * segundo plano (sem conexão), a notificação já está persistida no backend e
 * aparece no próximo `GET /notifications/unread-count` — o refetch em foreground
 * de `useUnreadNotificationsCount` cobre esse caso; este hook é só o atalho em
 * tempo real enquanto o app está ativo.
 *
 * A conexão é pausada quando o app vai para segundo plano e retomada ao voltar.
 *
 * @param enabled - passe false para não conectar (ex.: usuário deslogado).
 */
export function useNotificationEvents(enabled = true) {
  const queryClient = useQueryClient();
  const disconnectRef = useRef<(() => void) | null>(null);

  function handleEvent(event: NotificationSSEEvent) {
    switch (event.event) {
      case 'connected':
        if (__DEV__) console.log('[NOTIFICATION-SSE] conectado:', event.user);
        break;

      case 'notification_new': {
        const item: NotificationItem = { ...event.notification, read: false };

        queryClient.setQueriesData<NotificationsCache>({ queryKey: ['notifications'] }, (data) => {
          if (!data || data.pages.length === 0) return data;
          const [first, ...rest] = data.pages;
          return { ...data, pages: [{ ...first, items: [item, ...first.items] }, ...rest] };
        });

        queryClient.setQueryData<UnreadCountResponse>(['notifications-unread-count'], (data) => ({
          count: (data?.count ?? 0) + 1,
        }));
        break;
      }

      default:
        break;
    }
  }

  function connect() {
    if (disconnectRef.current) return; // já conectado
    disconnectRef.current = connectNotificationEvents(handleEvent);
  }

  function disconnect() {
    disconnectRef.current?.();
    disconnectRef.current = null;
  }

  useEffect(() => {
    if (!enabled) return;

    connect();

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        connect();
      } else {
        disconnect();
      }
    });

    return () => {
      sub.remove();
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
