import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FriendshipActionResult } from './dto';

// DELETE /friends/{user_id} — desfazer uma amizade aceita (soft delete da aresta).
export async function unfriend(userId: string): Promise<FriendshipActionResult> {
  const response = await apiFetch(`/friends/${userId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('friends.errors.unfriendFailed')));
  }
  return readContent<FriendshipActionResult>(response);
}
