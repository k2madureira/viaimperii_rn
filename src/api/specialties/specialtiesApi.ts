import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface Specialty {
  id: number;
  name: string;
  latin_name: string | null;
  description: string | null;
  icon: string | null;
  icon_url: string | null;
}

interface PaginatedSpecialties {
  page: number;
  perPage: number;
  total: number;
  items: Specialty[];
}

export async function getSpecialties(): Promise<Specialty[]> {
  const response = await apiFetch('/specialties?page=1&perPage=20');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar especialidades'));
  }

  const data = await readContent<PaginatedSpecialties>(response);
  return data.items ?? [];
}
