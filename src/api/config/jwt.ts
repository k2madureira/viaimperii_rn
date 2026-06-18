/** Decodifica base64url (com fallback manual caso `atob` não exista no runtime). */
function base64UrlDecode(input: string): string {
  let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';

  if (typeof atob === 'function') return atob(b64);

  // Fallback (polyfill mínimo de atob)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const str = b64.replace(/=+$/, '');
  let output = '';
  for (let bc = 0, bs = 0, buffer, i = 0; (buffer = str.charAt(i++)); ) {
    const idx = chars.indexOf(buffer);
    if (idx === -1) continue;
    bs = bc % 4 ? bs * 64 + idx : idx;
    if (bc++ % 4) output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
  }
  return output;
}

/** Retorna o `exp` (em segundos epoch) de um JWT, ou null se não der para ler. */
export function getTokenExp(token: string | null | undefined): number | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/**
 * Indica se o token expirou (com folga de `skewSeconds`).
 * Se o `exp` não puder ser lido, retorna false (não assume expiração)
 * para não disparar refresh/logout indevido em 401 de regra de negócio.
 */
export function isTokenExpired(token: string | null | undefined, skewSeconds = 30): boolean {
  const exp = getTokenExp(token);
  if (exp == null) return false;
  return Date.now() / 1000 >= exp - skewSeconds;
}
