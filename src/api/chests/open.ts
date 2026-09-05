import { apiFetch, readContent, throwApiError } from '../config/defaultApi';
import { OpenChestRequest, OpenChestResponse } from './dto';

// Abrir/escolher. Efeito: avatar → user_assets (posse); missão → ativa a
// profissão dela grátis. Erros: 409 já aberto · 403 não é seu · 422 escolha
// inválida / faltando slot / avatar não-mítico.
export async function openChest(
  userChestId: number,
  payload: OpenChestRequest,
): Promise<OpenChestResponse> {
  const response = await apiFetch(`/chests/${userChestId}/open`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, 'Erro ao abrir o baú');
  }

  return readContent<OpenChestResponse>(response);
}
