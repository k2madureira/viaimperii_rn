import { apiFetch, readContent, throwApiError } from '../config/defaultApi';
import { FounderPreRegisterRequest, FounderPreRegisterResponse } from './dto';

// Público. Erros: 409 e-mail já tem conta / já está na waitlist · 403 pré-inscrição
// fechada — o chamador diferencia pelo `status` do ApiError.
export async function preRegisterFounder(
  payload: FounderPreRegisterRequest,
): Promise<FounderPreRegisterResponse> {
  const response = await apiFetch('/founder/pre-register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, 'Erro ao fazer a pré-inscrição');
  }

  return readContent<FounderPreRegisterResponse>(response);
}
