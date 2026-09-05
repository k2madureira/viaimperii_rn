import * as SecureStore from 'expo-secure-store';
import { notifySessionExpired, notifyTokensRefreshed } from './authBridge';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;

export const ACCESS_KEY = 'access_token';
export const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

// Deduplica refreshes concorrentes: várias requisições que recebem 401
// ao mesmo tempo compartilham a mesma promessa de refresh.
let inFlight: Promise<string | null> | null = null;

/**
 * Tenta renovar o access token usando o refresh token.
 * Sucesso → grava os novos tokens e notifica o contexto, retorna o novo access.
 * Falha (endpoint ausente, refresh expirado, rede) → limpa a sessão
 * (logout automático) e retorna null.
 *
 * Contrato assumido do backend (a implementar):
 *   POST /auth/refresh  body: { refresh_token }  →  { access_token, refresh_token }
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!inFlight) {
    inFlight = doRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function doRefresh(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refreshToken) {
    await expireSession();
    return null;
  }

  try {
    let res = await postRefresh(refreshToken);

    // 429 rate-limited: NÃO desloga (a sessão continua válida) — respeita o
    // Retry-After e tenta UMA vez. Se ainda falhar, deixa a request original
    // falhar e a sessão intacta para o próximo refresh.
    if (res.status === 429) {
      const waitMs = retryAfterMs(res);
      if (waitMs > 0) await sleep(waitMs);
      res = await postRefresh(refreshToken);
      if (res.status === 429) return null;
    }

    // Qualquer outra falha (401 reuse detectado / expirado / inválido) → a sessão
    // foi revogada no servidor: limpa tudo e volta ao login.
    if (!res.ok) {
      await expireSession();
      return null;
    }

    const json = await res.json().catch(() => null);
    const data = json?.content ?? json;
    const newAccess: string | undefined = data?.access_token;
    const newRefresh: string = data?.refresh_token ?? refreshToken;

    if (!newAccess) {
      await expireSession();
      return null;
    }

    await SecureStore.setItemAsync(ACCESS_KEY, newAccess);
    await SecureStore.setItemAsync(REFRESH_KEY, newRefresh);
    notifyTokensRefreshed(newAccess, newRefresh);
    return newAccess;
  } catch {
    await expireSession();
    return null;
  }
}

function postRefresh(refreshToken: string): Promise<Response> {
  return fetch(`${API_HOST}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

/** Lê o header Retry-After (segundos ou data HTTP) em ms; 0 se ausente/inválido. */
function retryAfterMs(res: Response): number {
  const raw = res.headers.get('Retry-After');
  if (!raw) return 0;
  const secs = Number(raw);
  if (Number.isFinite(secs)) return Math.max(0, secs * 1000);
  const date = Date.parse(raw);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : 0;
}

function sleep(ms: number): Promise<void> {
  // Teto de 10s: o apiFetch tem timeout de 60s, então uma espera curta cabe sem
  // estourar a request original.
  return new Promise((resolve) => setTimeout(resolve, Math.min(ms, 10000)));
}

/** Limpa a sessão e avisa o contexto (logout automático → volta ao login). */
async function expireSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
  notifySessionExpired();
}

/**
 * Encerra a sessão local e volta ao login. Usado quando o servidor sinaliza que
 * a sessão foi revogada (401 "Token revoked." após logout em outro dispositivo,
 * ou reuse de refresh detectado) mesmo com o access token ainda não expirado.
 */
export function clearSession(): Promise<void> {
  return expireSession();
}
