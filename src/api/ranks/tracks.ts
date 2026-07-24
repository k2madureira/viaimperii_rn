import { apiFetch, readContent, readError } from '../config/defaultApi';
import { Track } from './dto';

export async function getTracks(): Promise<Track[]> {
  const response = await apiFetch('/tracks');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar trilhas'));
  }

  const data = await readContent<Track[]>(response);
  return Array.isArray(data) ? data : [];
}
