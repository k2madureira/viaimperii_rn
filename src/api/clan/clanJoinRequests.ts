import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanJoinRequestsResponse } from './dto';

// GET /clans/{id}/join-requests — fila de solicitações pendentes do clã (capitão+).
export async function getClanJoinRequests(clanId: number): Promise<ClanJoinRequestsResponse> {
  const response = await apiFetch(`/clans/${clanId}/join-requests`);
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.loadError')));
  }
  return readContent<ClanJoinRequestsResponse>(response);
}
