import { apiFetch, readContent, readError } from '../config/defaultApi';
import { AssetItem } from './dto';

// Avatares (cosméticos) que o usuário já possui, com qual está ativo.
export async function getOwnedAssets(type = 'avatar'): Promise<AssetItem[]> {
  const response = await apiFetch(`/assets/owned${type ? `?type=${type}` : ''}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar seus avatares'));
  }

  return readContent<AssetItem[]>(response);
}
