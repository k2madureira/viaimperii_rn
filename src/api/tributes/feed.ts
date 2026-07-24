import { apiFetch, readContent, readError } from '../config/defaultApi';
import { SendFeedTributeInput, TributeApiError, TributeResult } from './dto';

// POST /feed/{event_id}/tribute — transfere moedas ao autor do post.
// 400 auto-tributo · 422 valor fora da faixa OU saldo insuficiente · 429 cap diário.
export async function sendFeedTribute({
  eventId,
  amount,
  unit = 'denarius',
}: SendFeedTributeInput): Promise<TributeResult> {
  const response = await apiFetch(`/feed/${eventId}/tribute`, {
    method: 'POST',
    body: JSON.stringify({ amount, unit }),
  });

  if (!response.ok) {
    throw new TributeApiError(
      response.status,
      await readError(response, 'Erro ao enviar o tributo'),
    );
  }

  return readContent<TributeResult>(response);
}
