import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { MyPresence, SettableStatus } from './dto';

// PATCH /users/me/presence — define o status de visibilidade do próprio usuário.
export async function setMyPresence(status: SettableStatus): Promise<MyPresence> {
  const response = await apiFetch('/users/me/presence', {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('presence.errors.update')));
  }
  return readContent<MyPresence>(response);
}
