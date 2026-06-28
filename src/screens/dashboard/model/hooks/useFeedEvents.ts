import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import { connectFeedEvents, FeedEvent } from '../../../../api/feed/feedEvents';

/**
 * Mantém uma conexão SSE persistente com GET /feed/events?token=<token>.
 *
 * - `feed_new_item`: um novo evento entrou na timeline → invalida o feed para
 *   trazer a cabeça atualizada.
 * - `feed_activity`: alguém reagiu/comentou num conteúdo meu → invalida o feed
 *   (contadores) e, no caso de comentário, a thread.
 *
 * A conexão é pausada quando o app vai para segundo plano e retomada ao voltar.
 *
 * @param enabled - passe false para não conectar (ex.: usuário deslogado).
 */
export function useFeedEvents(enabled = true) {
  const queryClient = useQueryClient();
  const disconnectRef = useRef<(() => void) | null>(null);

  function handleEvent(event: FeedEvent) {
    switch (event.type) {
      case 'connected':
        if (__DEV__) console.log('[FEED-SSE] conectado:', event.user);
        break;

      case 'feed_new_item':
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        break;

      case 'feed_activity':
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        if (event.kind === 'comment' && event.feed_event_id != null) {
          queryClient.invalidateQueries({ queryKey: ['feed-comments', event.feed_event_id] });
        }
        break;

      default:
        break;
    }
  }

  function connect() {
    if (disconnectRef.current) return; // já conectado
    disconnectRef.current = connectFeedEvents(handleEvent);
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
