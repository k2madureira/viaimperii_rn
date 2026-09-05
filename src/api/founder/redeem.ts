import { apiFetch, readContent, throwApiError } from '../config/defaultApi';
import { FounderRedeemRequest, FounderRedeemResponse } from './dto';

// Autenticado (self): POST /users/me/founder. Erros: 404 código inexistente ·
// 410 expirado · 409 já usado / coorte cheia / já é fundador · 403 e-mail da
// conta ≠ e-mail do código — o chamador diferencia pelo `status` do ApiError.
export async function redeemFounderCode(
  payload: FounderRedeemRequest,
): Promise<FounderRedeemResponse> {
  const response = await apiFetch('/users/me/founder', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, 'Erro ao resgatar o código de fundador');
  }

  return readContent<FounderRedeemResponse>(response);
}
