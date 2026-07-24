import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FriendRequestsResponse, RequestDirection } from './dto';

// GET /friends/requests?direction=incoming|outgoing — pedidos pendentes.
export async function getFriendRequests(
  direction: RequestDirection,
): Promise<FriendRequestsResponse> {
  const response = await apiFetch(`/friends/requests?direction=${direction}`);
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('friends.errors.loadRequests')));
  }
  return readContent<FriendRequestsResponse>(response);
}
