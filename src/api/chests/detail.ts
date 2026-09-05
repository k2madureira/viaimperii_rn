import { apiFetch, readContent, throwApiError } from '../config/defaultApi';
import { ChestDetail } from './dto';

// Detalhe do baú (monta o seletor). `id` = user_chest id. Erros: 403 não é seu.
export async function getChest(userChestId: number): Promise<ChestDetail> {
  const response = await apiFetch(`/chests/${userChestId}`);

  if (!response.ok) {
    await throwApiError(response, 'Erro ao carregar o baú');
  }

  return readContent<ChestDetail>(response);
}
