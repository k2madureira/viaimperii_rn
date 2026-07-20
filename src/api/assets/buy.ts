import { apiFetch, readContent, readError } from '../config/defaultApi';
import { BuyAssetResponse } from './dto';

// Compra com moedas. 409 se já possui, 422 se saldo insuficiente.
export async function buyAsset(slug: string): Promise<BuyAssetResponse> {
  const response = await apiFetch(`/assets/${slug}/buy`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao comprar avatar'));
  }

  return readContent<BuyAssetResponse>(response);
}
