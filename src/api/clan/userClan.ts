import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { UserClanResponse } from './dto';

// GET /users/{id}/clan — o clã do usuário + sua divisão (clã nulo se não pertence a nenhum).
export async function getUserClan(userId: string): Promise<UserClanResponse> {
  const response = await apiFetch(`/users/${userId}/clan`);
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.loadError')));
  }
  return readContent<UserClanResponse>(response);
}
