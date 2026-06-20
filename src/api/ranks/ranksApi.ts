import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface Track {
  id: number;
  name: string;
  slug: string; // 'legionarios' | 'patricios'
  description: string | null;
}

export interface Rank {
  id: number;
  name: string;
  level: number;
  description: string | null;
  icon_url: string | null;
  image_url: string | null;
  track_id: number | null; // NULL = patente compartilhada (Recruta I-IV, Governador+)
}

interface PaginatedRanks {
  page: number;
  perPage: number;
  total: number;
  items: Rank[];
}

export async function getTracks(): Promise<Track[]> {
  const response = await apiFetch('/tracks');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar trilhas'));
  }

  const data = await readContent<Track[]>(response);
  return Array.isArray(data) ? data : [];
}

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
