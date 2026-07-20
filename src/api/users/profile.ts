import { apiFetch, readContent, readError } from '../config/defaultApi';
import { GetUserResponse } from './dto';

export async function getUserProfile(userId: string): Promise<GetUserResponse> {
  const response = await apiFetch(`/users/${userId}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar perfil'));
  }

  return readContent<GetUserResponse>(response);
}
