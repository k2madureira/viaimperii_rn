import { apiFetch, readContent, readError } from '../config/defaultApi';
import { Mission, MissionSort, MissionStatus, PaginatedMissions } from './dto';

export async function getMissions(
  status?: MissionStatus,
  sort?: MissionSort,
  professionId?: number,
): Promise<PaginatedMissions> {
  const parts = ['page=1', 'perPage=100'];
  if (status) parts.push(`status=${status}`);
  if (sort) parts.push(`sortField=${sort.sortField}`, `sortOrder=${sort.sortOrder}`);
  // Missões de profissão (opt-in): só aparecem quando filtradas pela profissão ativa.
  if (professionId != null) parts.push(`professionId=${professionId}`);
  const response = await apiFetch(`/missions?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões'));
  }

  const data = await readContent<PaginatedMissions | Mission[]>(response);
  return Array.isArray(data)
    ? { page: 1, perPage: data.length, totalItems: data.length, items: data }
    : data;
}
