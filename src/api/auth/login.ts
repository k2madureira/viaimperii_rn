import { LoginFormData } from '../../screens/auth/login/model/contracts/loginSchema';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LoginResponse } from './dto';

export async function loginRequest(data: LoginFormData): Promise<LoginResponse> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'America/Sao_Paulo';
  const response = await apiFetch('/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify({ ...data, timezone }),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        'Cadastro incompleto. Verifique seu e-mail e use o código recebido para definir sua especialidade.',
      );
    }
    throw new Error(await readError(response, 'Erro ao fazer login'));
  }

  return readContent<LoginResponse>(response);
}
