import { apiFetch, readError } from '../config/defaultApi';

export async function updatePasswordRequest(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const response = await apiFetch('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });

  if (!response.ok) {
    const detail = await readError(response, '');

    if (response.status === 401) {
      const d = detail.toLowerCase();
      const isWrongPassword =
        d.includes('password') ||
        d.includes('senha') ||
        d.includes('incorrect') ||
        d.includes('incorreta') ||
        d.includes('invalid credentials') ||
        d === '';
      throw new Error(
        isWrongPassword ? 'Senha atual incorreta.' : 'Sessão expirada. Faça login novamente.',
      );
    }

    throw new Error(detail || 'Erro ao atualizar senha');
  }
}
