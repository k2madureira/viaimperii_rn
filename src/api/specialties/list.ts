import { apiFetch, readContent, readError } from '../config/defaultApi';
import { PaginatedSpecialties, Specialty } from './dto';

export async function getSpecialties(): Promise<Specialty[]> {
  const response = await apiFetch('/specialties?page=1&perPage=20');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar especialidades'));
  }

  const data = await readContent<PaginatedSpecialties>(response);
  return data.items ?? [];
}
