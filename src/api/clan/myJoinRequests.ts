import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { MyClanJoinRequestsResponse } from './dto';

// GET /clans/join-requests/mine — minhas solicitações de ingresso pendentes.
export async function getMyJoinRequests(): Promise<MyClanJoinRequestsResponse> {
  const response = await apiFetch('/clans/join-requests/mine');
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.loadError')));
  }
  return readContent<MyClanJoinRequestsResponse>(response);
}
