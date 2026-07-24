import { apiFetch, readError } from '../config/defaultApi';

export async function forgotPasswordRequest(email: string): Promise<void> {
  const response = await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao solicitar redefinição de senha'));
  }
}
