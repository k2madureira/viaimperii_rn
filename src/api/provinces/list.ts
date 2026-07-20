import { apiFetch, readContent, readError } from '../config/defaultApi';
import { PaginatedProvinces, Province } from './dto';

// Busca provincias; `name` faz busca inteligente (ignora acento/caixa, com fallback fuzzy).
export async function getProvinces(name?: string, countryId?: number): Promise<Province[]> {
  const parts = ['page=1', 'perPage=60'];
  if (name) parts.push(`name=${encodeURIComponent(name)}`);
  if (countryId != null) parts.push(`countryId=${countryId}`);

  const response = await apiFetch(`/provinces?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar províncias'));
  }

  const data = await readContent<PaginatedProvinces | Province[]>(response);
  return Array.isArray(data) ? data : (data?.items ?? []);
}
