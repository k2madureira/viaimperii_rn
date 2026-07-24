import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FriendsListResponse } from './dto';

// GET /friends — amigos aceitos do usuário logado (mais recentes primeiro).
export async function getFriends(): Promise<FriendsListResponse> {
  const response = await apiFetch('/friends');
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('friends.errors.loadFriends')));
  }
  return readContent<FriendsListResponse>(response);
}
