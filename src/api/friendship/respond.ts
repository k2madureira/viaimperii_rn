import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FriendshipActionResult } from './dto';

// POST /friends/requests/{id}/accept — aceitar um pedido recebido (só o addressee).
export async function acceptFriendRequest(
  friendshipId: number,
): Promise<FriendshipActionResult> {
  const response = await apiFetch(`/friends/requests/${friendshipId}/accept`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('friends.errors.respondFailed')));
  }
  return readContent<FriendshipActionResult>(response);
}

// POST /friends/requests/{id}/decline — recusar um pedido recebido (só o addressee).
export async function declineFriendRequest(
  friendshipId: number,
): Promise<FriendshipActionResult> {
  const response = await apiFetch(`/friends/requests/${friendshipId}/decline`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('friends.errors.respondFailed')));
  }
  return readContent<FriendshipActionResult>(response);
}
