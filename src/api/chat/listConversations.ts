import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ConversationsResponse } from './dto';

// GET /chat/conversations — inbox do usuário logado, mais recentes primeiro,
// com contadores de não-lidas.
export async function getConversations(): Promise<ConversationsResponse> {
  const response = await apiFetch('/chat/conversations');
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('chat.errors.loadConversations')));
  }
  return readContent<ConversationsResponse>(response);
}
