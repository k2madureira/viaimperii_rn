import { useEffect, useRef } from 'react';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import { connectChatEvents, ChatSSEEvent } from '../../../../api/chat/chatEvents';
import { MessageItem, MessagesResponse } from '../../../../api/chat';

type MessagesCache = InfiniteData<MessagesResponse>;

/**
 * Mantém a conexão SSE de chat aberta enquanto a tela está montada e ativa.
 *
 * `chat_message`: insere a mensagem recebida no cache do histórico da conversa (se
 * aberto) e revalida o inbox (preview + não-lidas). `chat_read`: revalida o inbox.
 * A conexão pausa em segundo plano e retoma ao voltar. O backend não ecoa a
 * mensagem para quem enviou — este stream só entrega mensagens de OUTROS.
 */
export function useChatEvents(enabled = true) {
  const qc = useQueryClient();
  const disconnectRef = useRef<(() => void) | null>(null);

  function handleEvent(event: ChatSSEEvent) {
    switch (event.event) {
      case 'connected':
        if (__DEV__) console.log('[CHAT-SSE] conectado:', event.user);
        break;

      case 'chat_message': {
        const m = event.message;

        qc.setQueriesData<MessagesCache>(
          { queryKey: ['chat', 'messages', m.conversation_id] },
          (data) => {
            if (!data || data.pages.length === 0) return data;
            const already = data.pages.some((p) => p.items.some((it) => it.id === m.message_id));
            if (already) return data;
            const item: MessageItem = {
              id: m.message_id,
              conversation_id: m.conversation_id,
              sender: m.sender,
              kind: m.kind,
              body: m.body_preview,
              status: 'visible',
              is_mine: false,
              created_at: m.created_at,
            };
            const [first, ...rest] = data.pages;
            return { ...data, pages: [{ ...first, items: [item, ...first.items] }, ...rest] };
          },
        );

        qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
        break;
      }

      case 'chat_read':
        qc.invalidateQueries({ queryKey: ['chat', 'conversations'] });
        break;

      default:
        break;
    }
  }

  function connect() {
    if (disconnectRef.current) return;
    disconnectRef.current = connectChatEvents(handleEvent);
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
