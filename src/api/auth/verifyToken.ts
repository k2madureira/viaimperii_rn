import { apiFetch, readContent, readError } from '../config/defaultApi';
import { VerifyTokenResponse } from './dto';

export async function verifyTokenRequest(
  email: string,
  test_code: string,
): Promise<VerifyTokenResponse> {
  const response = await apiFetch('/specialty-quiz/verify', {
    method: 'POST',
    body: JSON.stringify({ email, test_code }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Código inválido ou expirado'));
  }

  return readContent<VerifyTokenResponse>(response);
}
