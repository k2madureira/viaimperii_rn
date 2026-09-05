import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FavoriteResult } from './dto';

// Favorita a missão (idempotente). 404 se o slug não existe.
export async function favoriteMission(slug: string): Promise<FavoriteResult> {
  const response = await apiFetch(`/missions/${slug}/favorite`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao favoritar missão'));
  }

  return readContent<FavoriteResult>(response);
}
