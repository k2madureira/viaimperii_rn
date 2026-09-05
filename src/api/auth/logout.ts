import * as SecureStore from 'expo-secure-store';
import { apiFetch } from '../config/defaultApi';
import { REFRESH_KEY } from '../config/tokenManager';

/**
 * Revoga a sessão no servidor (POST /auth/logout → sempre 204).
 * Envia o refresh_token no body para o backend invalidá-lo. Autenticado pelo
 * header Authorization; chamar ANTES de apagar os tokens locais.
 * Best-effort — não bloqueia nem quebra o logout do cliente.
 */
export async function logoutRequest(): Promise<void> {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
    });
  } catch {
    // best-effort: a sessão também expira sozinha; não deve travar o logout.
  }
}
