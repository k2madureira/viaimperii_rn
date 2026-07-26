import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ReadResponse } from './dto';

// POST /chat/conversations/{id}/read — marca a conversa lida até uma mensagem
// (zera o contador de não-lidas e emite o read receipt via SSE).
export async function markRead(
  conversationId: number,
  lastReadMessageId: number,
): Promise<ReadResponse> {
  const response = await apiFetch(`/chat/conversations/${conversationId}/read`, {
    method: 'POST',
    body: JSON.stringify({ last_read_message_id: lastReadMessageId }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('chat.errors.markRead')));
  }
  return readContent<ReadResponse>(response);
}
