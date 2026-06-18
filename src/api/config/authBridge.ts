/**
 * Ponte entre o tokenManager (fora do React) e o AuthContext.
 * O contexto registra handlers para reagir a refresh/expiração de sessão
 * disparados por chamadas de API.
 */
interface AuthHandlers {
  onTokensRefreshed?: (accessToken: string, refreshToken: string) => void;
  onSessionExpired?: () => void;
}

let handlers: AuthHandlers = {};

export function registerAuthHandlers(h: AuthHandlers) {
  handlers = h;
}

export function notifyTokensRefreshed(accessToken: string, refreshToken: string) {
  handlers.onTokensRefreshed?.(accessToken, refreshToken);
}

export function notifySessionExpired() {
  handlers.onSessionExpired?.();
}
