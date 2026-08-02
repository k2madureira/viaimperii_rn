import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanInvitesResponse } from './dto';

// GET /clans/invites — meus convites de clã pendentes.
export async function getMyClanInvites(): Promise<ClanInvitesResponse> {
  const response = await apiFetch('/clans/invites');
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.loadError')));
  }
  return readContent<ClanInvitesResponse>(response);
}
