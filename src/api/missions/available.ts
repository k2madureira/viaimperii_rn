import { apiFetch, readContent, readError } from '../config/defaultApi';
import { MissionDifficulty, PaginatedMissions } from './dto';

export async function getAvailableMissions(
  specialtyId?: number,
  difficulty?: MissionDifficulty,
  page = 1,
  perPage = 50,
  professionId?: number,
): Promise<PaginatedMissions> {
  const parts = [`page=${page}`, `perPage=${perPage}`];
  if (specialtyId != null) parts.push(`specialtyId=${specialtyId}`);
  if (difficulty != null) parts.push(`difficulty=${difficulty}`);
  // Restringe às missões da profissão ativa (422 no backend se não for do usuário).
  if (professionId != null) parts.push(`professionId=${professionId}`);

  const response = await apiFetch(`/missions/available?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões disponíveis'));
  }

  return readContent<PaginatedMissions>(response);
}
