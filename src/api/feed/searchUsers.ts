import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FeedAuthor } from './dto';

interface UserSearchResponse {
  items: FeedAuthor[];
}

/**
 * Busca usuários por username para o autocomplete de menções. Como `username`
 * não é único, pode trazer homônimos — o client resolve o escolhido pelo `id`
 * (uuid) e o envia em `mentions`. Tolerante ao formato de resposta.
 */
export async function searchUsers(q: string, limit = 8): Promise<FeedAuthor[]> {
  const response = await apiFetch(`/users/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao buscar usuários'));
  }
  const data = await readContent<UserSearchResponse | FeedAuthor[]>(response);
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}
