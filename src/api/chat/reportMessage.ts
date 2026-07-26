import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { SimpleMessageResponse } from './dto';

// POST /chat/messages/{id}/report — denúncia advisory (marca para revisão do admin).
export async function reportMessage(
  messageId: number,
  reason?: string,
): Promise<SimpleMessageResponse> {
  const response = await apiFetch(`/chat/messages/${messageId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason ?? null }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('chat.errors.reportMessage')));
  }
  return readContent<SimpleMessageResponse>(response);
}
