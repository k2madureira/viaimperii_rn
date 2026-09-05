import { apiFetch, readContent, readError } from '../config/defaultApi';
import { SseTicketResponse } from './dto';

/**
 * Obtém um ticket efêmero (single-use, ~60s) para abrir UM stream SSE.
 * Autenticado pelo header Authorization (via apiFetch, que já cuida do refresh).
 * Gerar um novo ticket por conexão e a cada reconexão — ele expira rápido e não
 * pode ser reutilizado. Substitui o `?token=<jwt>` legado.
 */
export async function getSseTicket(): Promise<SseTicketResponse> {
  const response = await apiFetch('/auth/sse-ticket', { method: 'POST' });
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao obter ticket de conexão'));
  }
  return readContent<SseTicketResponse>(response);
}
