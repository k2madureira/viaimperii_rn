import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ConversationItem } from './dto';

// POST /chat/conversations/dm — abre (ou retorna) a DM com um amigo aceito.
// 422 se não for amigo aceito; 403 se houver bloqueio em qualquer direção (§4.7).
export async function openDm(userId: string): Promise<ConversationItem> {
  const response = await apiFetch('/chat/conversations/dm', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('chat.errors.openDm')));
  }
  return readContent<ConversationItem>(response);
}
