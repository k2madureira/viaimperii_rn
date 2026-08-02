import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { MessagesResponse } from './dto';

// GET /chat/conversations/{id}/messages — histórico keyset (mais recentes primeiro).
// `cursor` = retorna mensagens com id < cursor (página anterior/mais antiga).
export async function getMessages(
  conversationId: number,
  cursor?: number | null,
  perPage = 30,
): Promise<MessagesResponse> {
  const params = new URLSearchParams({ perPage: String(perPage) });
  if (cursor != null) params.set('cursor', String(cursor));
  const response = await apiFetch(
    `/chat/conversations/${conversationId}/messages?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('chat.errors.loadMessages')));
  }
  return readContent<MessagesResponse>(response);
}
