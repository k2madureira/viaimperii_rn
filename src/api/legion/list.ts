import { apiFetch, readContent, readError } from '../config/defaultApi';
import { IPaginated } from '../default/dto';
import { Legion } from './dto';

const ADMIN_LEGION = /equestris/i;

export async function getLegions(): Promise<Legion[]> {
  const response = await apiFetch('/legions?page=1&perPage=50');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar legiões'));
  }

  const data = await readContent<IPaginated<Legion> | Legion[]>(response);
  const items = Array.isArray(data) ? data : (data?.items ?? []);
  return items.filter((l) => !ADMIN_LEGION.test(l.name));
}