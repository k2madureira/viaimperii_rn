import { LoginFormData } from '../../screens/auth/login/model/contracts/loginSchema';
import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface LoginStreak {
  current_streak: number;
  longest_streak: number;
  last_login_date: string | null;
  timezone: string;
  bonus_pct: number;
  next_milestone: number;
  max_streak_days: number;
  is_max_bonus: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  email: string;
  name: string;
  is_admin: boolean;
  is_temporary_password: boolean;
  rank: string;
  total_xp: number;
  main_specialty: string | null;
  mastery: Record<string, number>;
  medals: string[];
  completed_missions: unknown[];
  completed_campaigns: string[];
  legion_id: number | null;
  province_id: number | null;
  streak?: LoginStreak | null;
}

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

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  invite_code?: string;
}

export interface CreateUserResponse {
  message: string;
  user: { id: string; name: string; rank: string; main_specialty: string | null };
  is_temporary_password: boolean;
  specialty_test_code: string | null;
}

export async function createUserRequest(data: CreateUserPayload): Promise<CreateUserResponse> {
  const response = await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao criar conta'));
  }

  return readContent<CreateUserResponse>(response);
}

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

export interface VerifyTokenResponse {
  user_id: string;
}

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

export async function forgotPasswordRequest(email: string): Promise<void> {
  const response = await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao solicitar redefinição de senha'));
  }
}


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
