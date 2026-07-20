import { apiFetch, readError } from '../config/defaultApi';

export async function resetPasswordRequest(
  token: string,
  newPassword: string,
): Promise<void> {
  const response = await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  if (!response.ok) {
    // 400 = token inválido/expirado/já usado; 422 = senha fraca (§3).
    throw new Error(await readError(response, 'Não foi possível redefinir a senha'));
  }
}
