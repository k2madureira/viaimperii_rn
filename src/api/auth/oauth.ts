import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LoginResponse } from './dto';

/**
 * Consulta o resultado do login social pelo `sid` (fluxo de polling). O backend roda o
 * OAuth no browser server-side e guarda o resultado por `sid`; o app pergunta aqui até
 * ficar pronto. Ver backend `POST /auth/oauth/poll`.
 *
 * Retorna `null` enquanto ainda está pendente (HTTP 202); o payload completo quando pronto.
 */
export async function oauthPoll(sid: string): Promise<LoginResponse | null> {
  const response = await apiFetch('/auth/oauth/poll', {
    method: 'POST',
    body: JSON.stringify({ sid }),
  });

  if (response.status === 202) return null; // ainda processando

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao concluir login social'));
  }

  return readContent<LoginResponse>(response);
}
