import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FavoriteResult } from './dto';

// Remove o favorito (idempotente, soft delete no backend).
export async function unfavoriteMission(slug: string): Promise<FavoriteResult> {
  const response = await apiFetch(`/missions/${slug}/favorite`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao remover favorito'));
  }

  return readContent<FavoriteResult>(response);
}
