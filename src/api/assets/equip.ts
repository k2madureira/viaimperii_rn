import { apiFetch, readContent, readError } from '../config/defaultApi';
import { EquipAssetResponse } from './dto';

// Ativa o avatar e desativa os outros do mesmo tipo.
export async function equipAsset(slug: string): Promise<EquipAssetResponse> {
  const response = await apiFetch(`/assets/${slug}/equip`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao equipar avatar'));
  }

  return readContent<EquipAssetResponse>(response);
}
