import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ChestListResponse } from './dto';

// Meus baús (autenticado).
export async function getChests(): Promise<ChestListResponse> {
  const response = await apiFetch('/chests');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar seus baús'));
  }

  return readContent<ChestListResponse>(response);
}
