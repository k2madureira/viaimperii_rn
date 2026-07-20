import { apiFetch, readContent, readError } from '../config/defaultApi';
import { RedeemResponse } from './dto';

// Resgata um produto com moedas do saldo geral (não-restrito). 422 se saldo insuficiente.
export async function redeemProduct(slug: string, shippingInfo?: string): Promise<RedeemResponse> {
  const response = await apiFetch(`/physical-products/${slug}/redeem`, {
    method: 'POST',
    body: JSON.stringify({ shipping_info: shippingInfo ?? null }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao resgatar o produto'));
  }

  return readContent<RedeemResponse>(response);
}
