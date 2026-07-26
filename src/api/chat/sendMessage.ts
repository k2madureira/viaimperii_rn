import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { MessageItem } from './dto';

// POST /chat/conversations/{id}/messages — envia uma mensagem de texto.
// 422 moderação/vazio; 429 rate limit (20/min·conversa, 500/dia); 403 sem acesso/bloqueio.
export async function sendMessage(conversationId: number, body: string): Promise<MessageItem> {
  const response = await apiFetch(`/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('chat.errors.sendMessage')));
  }
  return readContent<MessageItem>(response);
}
