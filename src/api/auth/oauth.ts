import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LoginResponse } from './dto';

export async function oauthRequest(
  provider: 'google' | 'github',
  accessToken: string,
): Promise<LoginResponse> {
  const response = await apiFetch(`/auth/${provider}`, {
    method: 'POST',
    body: JSON.stringify({ access_token: accessToken }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, `Erro ao fazer login com ${provider}`));
  }

  return readContent<LoginResponse>(response);
}
