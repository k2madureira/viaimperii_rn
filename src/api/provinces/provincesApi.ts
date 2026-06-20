import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface Province {
  id: number;
  name: string;
  abbreviation: string | null;
  country_id: number;
}

interface PaginatedProvinces {
  page: number;
  perPage: number;
  total: number;
  items: Province[];
}

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

export interface UpdateProvinceResult {
  message: string;
  province_id: number;
  province_name: string;
}

export async function updateUserProvince(
  userId: string,
  provinceId: number,
): Promise<UpdateProvinceResult> {
  const response = await apiFetch(`/users/${userId}/province`, {
    method: 'PATCH',
    body: JSON.stringify({ province_id: provinceId }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao atualizar província'));
  }

  return readContent<UpdateProvinceResult>(response);
}
