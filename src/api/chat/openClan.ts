import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ConversationItem } from './dto';

// POST /chat/conversations/clan — abre (ou cria, lazy) a sala do clã do usuário
// logado (sem body — o grupo vem do token). 403 se o usuário não está em nenhum
// clã. Idempotente: get-or-create por clã.
export async function openClanChat(): Promise<ConversationItem> {
  const response = await apiFetch('/chat/conversations/clan', { method: 'POST' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('chat.errors.openClan')));
  }
  return readContent<ConversationItem>(response);
}
