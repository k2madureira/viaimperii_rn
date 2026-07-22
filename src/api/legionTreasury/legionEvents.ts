import * as SecureStore from 'expo-secure-store';
import { ACCESS_KEY, refreshAccessToken } from '../config/tokenManager';
import { isTokenExpired } from '../config/jwt';
import { apiFetch } from '../config/defaultApi';
import { ProposalKind, ProposalStatus } from './dto';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;

/**
 * Encerra a sessão SSE de legião no servidor (DELETE /legions/events).
 * Best-effort — a conexão também cai quando o cliente aborta o XHR.
 */
export async function closeLegionEvents(): Promise<void> {
  try {
    await apiFetch('/legions/events', { method: 'DELETE' });
  } catch {
    // silencioso: não deve bloquear logout nem saída de tela.
  }
}

// Progresso de uma votação do cofre. O payload traz a APURAÇÃO INTEIRA, então a
// barra de 60% atualiza sem refetch — é o motivo do stream existir.
export interface LegionVoteEventPayload {
  proposal_id: number;
  legion_id: number;
  kind: ProposalKind;
  item_slug: string | null;
  status: ProposalStatus;
  price: number;
  votes_yes: number;
  votes_no: number;
  votes_required: number;
  eligible_voters: number;
  approval_pct: number;
  expires_at: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
}

export type LegionSSEEvent =
  | { event: 'connected'; user?: string }
  | { event: 'legion_vote_updated'; vote: LegionVoteEventPayload };

type Disconnect = () => void;

/**
 * Conecta ao SSE GET /legions/events?token=<access_token>.
 *
 * Hub DEDICADO, separado do de notificações: abrir e resolver uma votação já
 * geram notificação, mas o tique por voto não deve virar badge — ninguém quer
 * uma notificação a cada voto. Por isso este stream é aberto só nas telas de
 * legião/Sala de Guerra, não no app inteiro.
 *
 * Nunca é fonte da verdade: o estado persistido volta no próximo
 * `GET /legions/{id}/treasury`. Este stream é o atalho em tempo real por cima.
 *
 * Usa XMLHttpRequest (disponível no React Native) para ler o text/event-stream,
 * com reconexão em 3–5 s. Retorna a função para encerrar.
 */
export function connectLegionEvents(
  onEvent: (event: LegionSSEEvent) => void,
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
    xhr.open('GET', `${API_HOST}/legions/events?token=${encodeURIComponent(token)}`, true);
    xhr.setRequestHeader('Accept', 'text/event-stream');
    xhr.setRequestHeader('Cache-Control', 'no-cache');

    let lastIndex = 0;

    xhr.onreadystatechange = () => {
      if (closed || !xhr) return;

      const state = xhr.readyState;
      // 3 = LOADING (chunks chegando), 4 = DONE
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
      onError?.(new Error('Legion SSE connection error'));
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

// Separa explicitamente `event` (nome do evento SSE) de `vote` (payload): o JSON
// tem campos próprios (`status`, `kind`) que um spread achataria contra o nome
// do evento — o mesmo motivo pelo qual o parser de notificações não é genérico.
function parseSSEChunk(chunk: string, onEvent: (event: LegionSSEEvent) => void) {
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
        } else if (eventType === 'legion_vote_updated') {
          onEvent({ event: 'legion_vote_updated', vote: parsed as LegionVoteEventPayload });
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
