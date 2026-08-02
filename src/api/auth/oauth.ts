import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LoginResponse } from './dto';

/**
 * Troca o código one-time do handoff OAuth (recebido no deep link após o fluxo web
 * do backend) pelo payload completo de login. Ver backend `POST /auth/oauth/exchange`.
 */
export async function oauthExchange(code: string): Promise<LoginResponse> {
  const response = await apiFetch('/auth/oauth/exchange', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao concluir login social'));
  }

  return readContent<LoginResponse>(response);
}
