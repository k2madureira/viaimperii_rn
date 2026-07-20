import { apiFetch, readContent, readError } from '../config/defaultApi';
import { UserProfessionItem } from './dto';

// Profissões que o usuário já possui (GET /users/{id}/professions).
export async function getUserProfessions(userId: string): Promise<UserProfessionItem[]> {
  const response = await apiFetch(`/users/${userId}/professions`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar suas profissões'));
  }

  const data = await readContent<{ items: UserProfessionItem[] }>(response);
  return data.items ?? [];
}
