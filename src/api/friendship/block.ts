import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FriendshipActionResult } from './dto';

// POST /users/{id}/block — bloqueio assimétrico: encerra a amizade/pedido e some
// da busca/menção do outro. Backed pela mesma FriendshipService (§Amigos §3).
export async function blockUser(userId: string): Promise<FriendshipActionResult> {
  const response = await apiFetch(`/users/${userId}/block`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('friends.errors.blockFailed')));
  }
  return readContent<FriendshipActionResult>(response);
}

// DELETE /users/{id}/block — desbloquear (só quem bloqueou).
export async function unblockUser(userId: string): Promise<FriendshipActionResult> {
  const response = await apiFetch(`/users/${userId}/block`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('friends.errors.unblockFailed')));
  }
  return readContent<FriendshipActionResult>(response);
}
