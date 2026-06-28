import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface LegionProvince {
  id: number;
  name: string;
  quantityUsers: number;
}

export interface LegionCountry {
  id: number;
  name: string;
  icon_url: string | null;
  provinces: LegionProvince[];
}

export interface LegionDetail {
  id: number;
  name: string;
  symbol: string | null;
  description: string | null;
  image_url: string | null;
  specialty_id: number | null;
  total_users: number;
  countries: LegionCountry[];
}

export async function getLegion(legionId: number): Promise<LegionDetail> {
  const response = await apiFetch(`/legions/${legionId}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar a legião'));
  }

  return readContent<LegionDetail>(response);
}
