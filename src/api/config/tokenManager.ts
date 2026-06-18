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
    const res = await fetch(`${API_HOST}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

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

/** Limpa a sessão e avisa o contexto (logout automático → volta ao login). */
async function expireSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
  notifySessionExpired();
}
