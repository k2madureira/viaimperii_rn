import * as SecureStore from 'expo-secure-store';
import { isTokenExpired } from './jwt';
import { ACCESS_KEY, refreshAccessToken } from './tokenManager';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
const TIMEOUT_MS = 10000;

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
  const json = await response.json().catch(() => ({} as any));
  const body = json?.content ?? json;
  return body?.detail ?? body?.message ?? fallback;
}
