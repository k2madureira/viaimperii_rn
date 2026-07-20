import { apiFetch, readContent, readError } from '../config/defaultApi';
import { PaginatedRanks, Rank } from './dto';

// Passando trackId, o backend retorna as patentes da trilha + as compartilhadas.
export async function getRanks(trackId?: number | null): Promise<Rank[]> {
  const parts = ['page=1', 'perPage=100'];
  if (trackId != null) parts.push(`trackId=${trackId}`);

  const response = await apiFetch(`/ranks?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar patentes'));
  }

  const data = await readContent<PaginatedRanks | Rank[]>(response);
  return Array.isArray(data) ? data : (data?.items ?? []);
}
