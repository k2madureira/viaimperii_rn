import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanActionResponse } from './dto';

// POST /clans/{id}/join-requests — solicita ingresso no clã. 409 já em clã /
// cooldown / clã cheio / solicitação pendente; 429 cap diário de solicitações.
export async function requestJoinClan(clanId: number): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/${clanId}/join-requests`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.requestError')));
  }
  return readContent<ClanActionResponse>(response);
}
