import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FriendshipActionResult, SendFriendRequestInput } from './dto';

// POST /friends/requests — pedir amizade por @handle (ou user_id do autocomplete).
// Códigos de negócio viram mensagens nomeadas (§Amigos §6):
//   404 handle inexistente · 409 auto/já amigos/já enviado · 403 bloqueado · 429 cap diário.
export async function sendFriendRequest(
  input: SendFriendRequestInput,
): Promise<FriendshipActionResult> {
  const response = await apiFetch('/friends/requests', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const localized: Record<number, string> = {
      404: i18n.t('friends.errors.handleNotFound'),
      409: i18n.t('friends.errors.requestConflict'),
      403: i18n.t('friends.errors.blocked'),
      429: i18n.t('friends.errors.dailyLimit'),
    };
    const message =
      localized[response.status] ??
      (await readError(response, i18n.t('friends.errors.requestFailed')));
    throw new Error(message);
  }

  return readContent<FriendshipActionResult>(response);
}
