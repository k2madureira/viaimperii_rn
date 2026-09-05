import { apiFetch } from '../config/defaultApi';
import { getSseTicket } from '../auth/sseTicket';
import { FeedAuthor } from '../feed';
import { MessageKind } from './dto';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;

/**
 * Encerra a sessão SSE de chat no servidor (DELETE /chat/events). Chamar no
 * logout para o backend liberar a fila. Falha silenciosa (best-effort).
 */
export async function closeChatEvents(): Promise<void> {
  try {
    await apiFetch('/chat/events', { method: 'DELETE' });
  } catch {
    // best-effort: a conexão também cai quando o cliente aborta o XHR.
  }
}

// Nova mensagem numa conversa da qual o usuário participa (§Chat SSE `chat_message`).
// `body_preview` = corpo truncado (200 chars) — suficiente para a bolha/preview.
export interface ChatMessageEvent {
  conversation_id: number;
  message_id: number;
  sender: FeedAuthor | null;
  kind: MessageKind;
  body_preview: string;
  created_at: string;
}

// Read receipt de um participante (§Chat SSE `chat_read`). `user_id` = id numérico
// de quem leu (não o uuid).
export interface ChatReadEvent {
  conversation_id: number;
  user_id: number;
  last_read_message_id: number;
}

export type ChatSSEEvent =
  | { event: 'connected'; user?: string }
  | { event: 'chat_message'; message: ChatMessageEvent }
  | { event: 'chat_read'; read: ChatReadEvent };

type Disconnect = () => void;

/**
 * Conecta ao SSE GET /chat/events?ticket=<sse_ticket> (ticket single-use ~60s via
 * POST /auth/sse-ticket; o `?token=<jwt>` legado está deprecado).
 *
 * Push instantâneo (`chat_message`) quando chega mensagem numa conversa do usuário,
 * e `chat_read` para read receipts. A tabela `messages` é a fonte de verdade — este
 * stream é só o atalho em tempo real. Usa XMLHttpRequest (RN) para ler o
 * text/event-stream e reconecta com backoff em queda. Retorna uma função de encerrar.
 */
export function connectChatEvents(
  onEvent: (event: ChatSSEEvent) => void,
  onError?: (error: Error) => void,
): Disconnect {
  let closed = false;
  let xhr: XMLHttpRequest | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  async function connect() {
    if (closed) return;

    // Ticket single-use (~60s): um novo por conexão/reconexão. O apiFetch cuida
    // do header Authorization / refresh ao pedir o ticket.
    let ticket: string;
    try {
      ({ ticket } = await getSseTicket());
    } catch {
      if (!closed) reconnectTimer = setTimeout(connect, 5000);
      return;
    }

    if (closed) return;

    xhr = new XMLHttpRequest();
    xhr.open('GET', `${API_HOST}/chat/events?ticket=${encodeURIComponent(ticket)}`, true);
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
      onError?.(new Error('Chat SSE connection error'));
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

function parseSSEChunk(chunk: string, onEvent: (event: ChatSSEEvent) => void) {
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
        } else if (eventType === 'chat_message') {
          onEvent({ event: 'chat_message', message: parsed as ChatMessageEvent });
        } else if (eventType === 'chat_read') {
          onEvent({ event: 'chat_read', read: parsed as ChatReadEvent });
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
