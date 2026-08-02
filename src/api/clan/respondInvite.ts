import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanActionResponse } from './dto';

// POST /clans/invites/{id}/accept — aceitar convite (entra como soldado; re-checa
// 1-clã/cooldown/cap). Só o convidado (403), exige convite pendente (404).
export async function acceptClanInvite(inviteId: number): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/invites/${inviteId}/accept`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.inviteRespondError')));
  }
  return readContent<ClanActionResponse>(response);
}

// POST /clans/invites/{id}/decline — recusar convite.
export async function declineClanInvite(inviteId: number): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/invites/${inviteId}/decline`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.inviteRespondError')));
  }
  return readContent<ClanActionResponse>(response);
}
