import { apiFetch, readContent, readError } from '../config/defaultApi';
import { MissionDifficulty, RecommendedMissions } from './dto';

export async function getRecommendedMissions(
  specialtyId?: number,
  difficulty?: MissionDifficulty,
  type?: 'daily' | 'monthly',
  page = 1,
  perPage = 50,
): Promise<RecommendedMissions> {
  const parts = [`page=${page}`, `perPage=${perPage}`];
  if (specialtyId != null) parts.push(`specialtyId=${specialtyId}`);
  if (difficulty != null) parts.push(`difficulty=${difficulty}`);
  if (type != null) parts.push(`type=${type}`);

  const response = await apiFetch(`/missions/recommended?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões recomendadas'));
  }

  return readContent<RecommendedMissions>(response);
}
