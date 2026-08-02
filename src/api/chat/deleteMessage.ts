import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { SimpleMessageResponse } from './dto';

// DELETE /chat/messages/{id} — apaga a própria mensagem (soft delete).
export async function deleteMessage(messageId: number): Promise<SimpleMessageResponse> {
  const response = await apiFetch(`/chat/messages/${messageId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('chat.errors.deleteMessage')));
  }
  return readContent<SimpleMessageResponse>(response);
}
