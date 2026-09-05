import { apiFetch, readContent, readError } from '../config/defaultApi';
import { PaginatedMissions } from './dto';

// Lista "executar hoje": missões favoritadas ainda visíveis, com status por-usuário
// e o resumo `availableMissions`. Ordenada por mais recentemente favoritada primeiro.
export async function getFavoriteMissions(page = 1, perPage = 20): Promise<PaginatedMissions> {
  const response = await apiFetch(`/missions/favorites?page=${page}&perPage=${perPage}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões favoritas'));
  }

  return readContent<PaginatedMissions>(response);
}
