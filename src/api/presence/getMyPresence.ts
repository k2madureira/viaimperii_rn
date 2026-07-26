import i18n from '../../i18n';
import { apiFetch, readContent, readError } from '../config/defaultApi';
import { MyPresence } from './dto';

// GET /users/me/presence — presença real do usuário logado (status + online).
export async function getMyPresence(): Promise<MyPresence> {
  const response = await apiFetch('/users/me/presence');
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('presence.errors.load')));
  }
  return readContent<MyPresence>(response);
}
