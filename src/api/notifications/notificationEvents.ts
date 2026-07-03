import * as SecureStore from 'expo-secure-store';
import { ACCESS_KEY, refreshAccessToken } from '../config/tokenManager';
import { isTokenExpired } from '../config/jwt';
import { apiFetch } from '../config/defaultApi';
import { FeedAuthor } from '../feed/feedApi';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;

/**
 * Encerra a sessão SSE de notificações no servidor (DELETE /notifications/events).
 * Chamar no logout para o backend liberar a fila imediatamente. Falha silenciosa
 * (best-effort) — não bloqueia o logout.
 */
export async function closeNotificationEvents(): Promise<void> {
  try {
    await apiFetch('/notifications/events', { method: 'DELETE' });
  } catch {
    // best-effort: a conexão também cai quando o cliente aborta o XHR.
  }
}

// Notificação recém-publicada, como o backend envia no push (sem `read` — é
// sempre nova/não lida no momento em que chega).
export interface NotificationEventPayload {
  id: number;
  type: string;
  payload: Record<string, any>;
  actor: FeedAuthor | null;
  created_at: string;
}

export type NotificationSSEEvent =
  | { event: 'connected'; user?: string }
  | { event: 'notification_new'; notification: NotificationEventPayload };

type Disconnect = () => void;

/**
 * Conecta ao SSE GET /notifications/events?token=<access_token>.
 *
 * Push instantâneo (`notification_new`) quando uma notificação é criada para o
 * usuário logado — chega com `actor` já resolvido (avatar/nome/patente). Se o
 * usuário estiver offline, o push é pulado; a notificação já está persistida e
 * aparece no próximo `GET /notifications/unread-count` ao reabrir o app — este
 * stream é só um atalho em tempo real por cima disso, nunca a fonte de verdade.
 *
 * Usa XMLHttpRequest (disponível no React Native) para ler o stream
 * text/event-stream. Reconecta automaticamente em queda/erro com backoff de
 * 3–5 s. Retorna uma função para encerrar a conexão.
 */
export function connectNotificationEvents(
  onEvent: (event: NotificationSSEEvent) => void,
  onError?: (error: Error) => void,
): Disconnect {
  let closed = false;
  let xhr: XMLHttpRequest | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  async function connect() {
    if (closed) return;

    let token = await SecureStore.getItemAsync(ACCESS_KEY);

    if (token && isTokenExpired(token)) {
      token = await refreshAccessToken();
    }

    if (!token || closed) return;

    xhr = new XMLHttpRequest();
    xhr.open('GET', `${API_HOST}/notifications/events?token=${encodeURIComponent(token)}`, true);
    xhr.setRequestHeader('Accept', 'text/event-stream');
    xhr.setRequestHeader('Cache-Control', 'no-cache');

    let lastIndex = 0;

    xhr.onreadystatechange = () => {
      if (closed || !xhr) return;

      const state = xhr.readyState;
      // readyState 3 = LOADING (chunks chegando), 4 = DONE
      if (state === 3 || state === 4) {
        const text = xhr.responseText ?? '';
        if (text.length > lastIndex) {
          parseSSEChunk(text.slice(lastIndex), onEvent);
          lastIndex = text.length;
        }
      }

      if (state === 4 && !closed) {
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    xhr.onerror = () => {
      onError?.(new Error('Notification SSE connection error'));
      if (!closed) {
        reconnectTimer = setTimeout(connect, 5000);
      }
    };

    xhr.send(null);
  }

  connect();

  return () => {
    closed = true;
    if (reconnectTimer != null) clearTimeout(reconnectTimer);
    xhr?.abort();
    xhr = null;
  };
}

// ── SSE parser ────────────────────────────────────────────────────────────────

// Não reaproveita o parser genérico do feed/missões: o JSON de `notification_new`
// carrega seu próprio campo `type` (tipo da notificação, ex. "feed_comment"). O
// parser do feed faz `{ type: eventType, ...parsed }`, e como `parsed.type`
// vem depois no spread, ele sobrescreveria o `type` do evento SSE. Aqui separa-se
// explicitamente `event` (nome do evento SSE) de `notification` (o payload).
function parseSSEChunk(chunk: string, onEvent: (event: NotificationSSEEvent) => void) {
  let eventType = '';
  let dataStr = '';

  for (const raw of chunk.split('\n')) {
    const line = raw.trimEnd();

    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataStr = line.slice(5).trim();
    } else if (line === '' && dataStr) {
      try {
        const parsed = JSON.parse(dataStr) as Record<string, any>;
        if (eventType === 'connected') {
          onEvent({ event: 'connected', user: parsed.user });
        } else if (eventType === 'notification_new') {
          onEvent({ event: 'notification_new', notification: parsed as NotificationEventPayload });
        }
        // `: ping` chega como comentário SSE (sem `data:`), nunca cai aqui.
      } catch {
        // JSON malformado — ignora silenciosamente.
      }
      eventType = '';
      dataStr = '';
    }
  }
}
