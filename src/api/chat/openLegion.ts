import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ConversationItem } from './dto';

// POST /chat/conversations/legion — abre (ou cria, lazy) a sala da legião do
// usuário logado (sem body — o grupo vem do token). 403 se o usuário não está
// em nenhuma legião. Idempotente: get-or-create por legião.
export async function openLegionChat(): Promise<ConversationItem> {
  const response = await apiFetch('/chat/conversations/legion', { method: 'POST' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('chat.errors.openLegion')));
  }
  return readContent<ConversationItem>(response);
}
