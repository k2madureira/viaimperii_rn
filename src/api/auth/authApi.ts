import { LoginFormData } from '../../screens/auth/login/model/contracts/loginSchema';
import { apiFetch } from '../config/defaultApi';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export async function loginRequest(data: LoginFormData): Promise<LoginResponse> {
  const response = await apiFetch('/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? 'Erro ao fazer login');
  }

  return response.json();
}
