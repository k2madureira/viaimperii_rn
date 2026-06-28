import * as SecureStore from 'expo-secure-store';
import { ACCESS_KEY, refreshAccessToken } from '../config/tokenManager';
import { isTokenExpired } from '../config/jwt';
import { apiFetch } from '../config/defaultApi';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;

/**
 * Encerra a sessão SSE do feed no servidor (DELETE /feed/events).
 * Chamar no logout para o backend liberar a fila imediatamente. Falha silenciosa
 * (best-effort) — não bloqueia o logout.
 */
export async function closeFeedEvents(): Promise<void> {
  try {
    await apiFetch('/feed/events', { method: 'DELETE' });
  } catch {
    // best-effort: a conexão também cai quando o cliente aborta o XHR.
  }
}

export type FeedEventType = 'connected' | 'feed_new_item' | 'feed_activity' | 'ping';

export interface FeedEvent {
  type: FeedEventType;
  user?: string; // handshake `connected`
  // feed_new_item (broadcast de timeline)
  id?: number;
  verb?: string;
  scope?: string;
  // feed_activity (alguém interagiu no meu conteúdo)
  kind?: 'reaction' | 'comment';
  feed_event_id?: number;
}

type Disconnect = () => void;

/**
 * Conecta ao SSE GET /feed/events?token=<access_token>.
 *
 * Usa XMLHttpRequest (disponível no React Native) para ler o stream
 * text/event-stream. Reconecta automaticamente em queda/erro com backoff de
 * 3–5 s. Retorna uma função para encerrar a conexão.
 */
export function connectFeedEvents(
  onEvent: (event: FeedEvent) => void,
  onError?: (error: Error) => void,
): Disconnect {
  let closed = false;
  let xhr: XMLHttpRequest | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  async function connect() {
    if (closed) return;

    let token = await SecureStore.getItemAsync(ACCESS_KEY);

    // Refresh proativo se o token expirou antes de abrir o stream.
    if (token && isTokenExpired(token)) {
      token = await refreshAccessToken();
    }

    if (!token || closed) return;

    xhr = new XMLHttpRequest();
    xhr.open('GET', `${API_HOST}/feed/events?token=${encodeURIComponent(token)}`, true);
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
      onError?.(new Error('Feed SSE connection error'));
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

function parseSSEChunk(chunk: string, onEvent: (event: FeedEvent) => void) {
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
        const parsed = JSON.parse(dataStr) as Record<string, unknown>;
        const type = (eventType || parsed.type) as FeedEventType | undefined;
        if (type && type !== 'ping') {
          onEvent({ type, ...parsed } as FeedEvent);
        }
      } catch {
        // JSON malformado — ignora silenciosamente.
      }
      eventType = '';
      dataStr = '';
    }
  }
}
