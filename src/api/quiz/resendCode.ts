import { apiFetch, readError } from '../config/defaultApi';

export async function resendTestCode(email: string): Promise<void> {
  const response = await apiFetch('/specialty-quiz/resend', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao reenviar código'));
  }
}
