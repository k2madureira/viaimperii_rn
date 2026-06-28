import * as SecureStore from 'expo-secure-store';
import { ACCESS_KEY, refreshAccessToken } from '../config/tokenManager';
import { isTokenExpired } from '../config/jwt';
import { apiFetch } from '../config/defaultApi';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;

/**
 * Encerra a sessão SSE no servidor (DELETE /missions/events).
 * Chamar no logout para o backend liberar a fila imediatamente, em vez de esperar
 * o timeout do próximo ping. Falha silenciosa (best-effort) — não bloqueia o logout.
 */
export async function closeMissionEvents(): Promise<void> {
  try {
    await apiFetch('/missions/events', { method: 'DELETE' });
  } catch {
    // best-effort: a conexão também cai quando o cliente aborta o XHR.
  }
}

export type MissionEventType =
  | 'connected'
  | 'mission_updated'
  | 'mission_completed'
  | 'mission_approved'
  | 'mission_rejected'
  | 'new_review_available'
  | 'ping';

export interface MissionEvent {
  type: MissionEventType;
  user?: string; // enviado no handshake `connected`
  mission_slug?: string;
  status?: string; // novo status da missão (mission_updated)
  executor_id?: string;
  xp_earned?: number;
  mastery_earned?: number;
  approvals_count?: number;
  approvals_required?: number;
}

type Disconnect = () => void;

/**
 * Connects to the SSE endpoint GET /missions/events?token=<access_token>.
 *
 * Uses XMLHttpRequest (available in React Native) to read the streaming
 * text/event-stream response. Reconnects automatically on disconnect or error
 * with a 3–5 s backoff. Returns a disconnect function to close the connection.
 */ 
export function connectMissionEvents(
  onEvent: (event: MissionEvent) => void,
  onError?: (error: Error) => void,
): Disconnect {
  let closed = false;
  let xhr: XMLHttpRequest | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  async function connect() {
    if (closed) return;

    let token = await SecureStore.getItemAsync(ACCESS_KEY);
 
  

    // Proactive refresh if token is expired before opening the stream.
    if (token && isTokenExpired(token)) {
      token = await refreshAccessToken();
    }

    if (!token || closed) return;

    xhr = new XMLHttpRequest();
    xhr.open(
      'GET',
      `${API_HOST}/missions/events?token=${encodeURIComponent(token)}`,
      true,
    );
    xhr.setRequestHeader('Accept', 'text/event-stream');
    xhr.setRequestHeader('Cache-Control', 'no-cache');

    let lastIndex = 0;

    xhr.onreadystatechange = () => {
      if (closed || !xhr) return;

      const state = xhr.readyState;
     
      // readyState 3 = LOADING (chunks arriving), 4 = DONE
      if (state === 3 || state === 4) {
        console.log('RESPONSE', xhr.responseText);
        console.log({ xhr })
        const text = xhr.responseText ?? '';
        if (text.length > lastIndex) {
          parseSSEChunk(text.slice(lastIndex), onEvent);
          lastIndex = text.length;
        }
      }

      if (state === 4) {
        // Stream closed — schedule reconnect unless explicitly disconnected.
        if (!closed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      }
    };

    xhr.onerror = () => {
      onError?.(new Error('SSE connection error'));
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

function parseSSEChunk(chunk: string, onEvent: (event: MissionEvent) => void) {
  let eventType = '';
  let dataStr = '';

  console.log({  chunk })
  for (const raw of chunk.split('\n')) {
    const line = raw.trimEnd();

    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim();

    } else if (line.startsWith('data:')) {
      dataStr = line.slice(5).trim();
      console.log({  dataStr })
    } else if (line === '' && dataStr) {
     
      try {
        const parsed = JSON.parse(dataStr) as Record<string, unknown>;
        const type = (eventType || parsed.type) as MissionEventType | undefined;

        console.log({  parsed, type })

        if (type && type !== 'ping') {
          onEvent({ type, ...parsed } as MissionEvent);
        }
      } catch {
        // Malformed JSON — ignore silently.
      }
      eventType = '';
      dataStr = '';
    }
  }
}
