import * as SecureStore from 'expo-secure-store';
import { isTokenExpired } from './jwt';
import { ACCESS_KEY, clearSession, refreshAccessToken } from './tokenManager';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
// 60s cobre o cold start do backend em produção (Railway hiberna quando ocioso; o
// 1º request após a hibernação — incl. claims/rewards — pode levar 30–60s até o
// serviço acordar). Vale para TODAS as requests que passam por apiFetch. Em dev é
// instantâneo, então não atrapalha.
const TIMEOUT_MS = 60000;

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return requestWithAuth(path, options, true);
}

async function requestWithAuth(
  path: string,
  options: RequestInit,
  allowRefresh: boolean,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let accessToken = await SecureStore.getItemAsync(ACCESS_KEY);

  // Refresh proativo: se o token expirou, renova antes de enviar.
  if (allowRefresh && accessToken && isTokenExpired(accessToken)) {
    accessToken = (await refreshAccessToken()) ?? accessToken;
  }

  try {
    const response = await fetch(`${API_HOST}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });

    // Refresh reativo: 401 com token expirado → renova e tenta de novo (uma vez).
    // 401 com token ainda válido = erro de regra de negócio → passa direto.
    if (response.status === 401 && allowRefresh && accessToken && isTokenExpired(accessToken)) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return requestWithAuth(path, options, false);
      }
    }

    // 401 com token AINDA válido pode ser sessão revogada no servidor (logout em
    // outro dispositivo, reuse de refresh) → o backend responde "Token revoked.".
    // Nesse caso a sessão acabou: limpa tudo e volta ao login. Demais 401 com
    // token válido são erros de regra de negócio e passam direto.
    if (response.status === 401 && allowRefresh && accessToken && !isTokenExpired(accessToken)) {
      const detail = await peekDetail(response);
      if (detail && /revok/i.test(detail)) {
        await clearSession();
      }
    }

    return response;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Tempo limite da requisição esgotado. Verifique sua conexão.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * O backend envolve TODA resposta JSON (sucesso e erro) em { time, content }.
 * Estes helpers desembrulham o `content` de forma consistente.
 */

/** Desembrulha o corpo de sucesso ({ time, content }) e retorna o content tipado. */
export async function readContent<T>(response: Response): Promise<T> {
  const json = await response.json();
  return (json?.content ?? json) as T;
}

/** Extrai a mensagem de erro de dentro do envelope { time, content: { detail } }. */
export async function readError(response: Response, fallback: string): Promise<string> {
  // 429 rate limit: mensagem amigável com o tempo do Retry-After (o corpo do
  // backend costuma ser técnico demais para o usuário final).
  if (response.status === 429) {
    const secs = retryAfterSeconds(response);
    return secs
      ? `Muitas tentativas. Tente novamente em ${secs}s.`
      : 'Muitas tentativas. Aguarde um momento e tente novamente.';
  }
  const json = await response.json().catch(() => ({} as any));
  const body = json?.content ?? json;
  return body?.detail ?? body?.message ?? fallback;
}

/** Segundos do header Retry-After (aceita segundos ou data HTTP); null se ausente. */
export function retryAfterSeconds(response: Response): number | null {
  const raw = response.headers.get('Retry-After');
  if (!raw) return null;
  const secs = Number(raw);
  if (Number.isFinite(secs)) return Math.max(0, Math.round(secs));
  const date = Date.parse(raw);
  return Number.isFinite(date) ? Math.max(0, Math.ceil((date - Date.now()) / 1000)) : null;
}

/**
 * Lê o `detail`/`message` de um 401 SEM consumir o corpo original (usa clone),
 * para que o chamador ainda possa ler a resposta depois. Retorna '' se falhar.
 */
async function peekDetail(response: Response): Promise<string> {
  try {
    const json = await response.clone().json();
    const body = json?.content ?? json;
    return (body?.detail ?? body?.message ?? '') as string;
  } catch {
    return '';
  }
}
