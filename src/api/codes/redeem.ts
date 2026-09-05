import { apiFetch, readContent, throwApiError } from '../config/defaultApi';
import { RedeemCodeRequest, RedeemCodeResponse } from './dto';

// Resgatar código promocional (autenticado). Erros: 404 código inexistente ·
// 410 expirado/inativo · 409 esgotado / já resgatado por você — o chamador
// diferencia pelo `status` do ApiError.
export async function redeemCode(payload: RedeemCodeRequest): Promise<RedeemCodeResponse> {
  const response = await apiFetch('/codes/redeem', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, 'Erro ao resgatar o código');
  }

  return readContent<RedeemCodeResponse>(response);
}
