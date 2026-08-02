import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanActionResponse } from './dto';

// POST /clans/join-requests/{id}/accept — aceita a solicitação (capitão+). O
// solicitante entra como soldado (re-checa 1-clã/cooldown/cap).
export async function acceptJoinRequest(requestId: number): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/join-requests/${requestId}/accept`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.requestRespondError')));
  }
  return readContent<ClanActionResponse>(response);
}

// POST /clans/join-requests/{id}/decline — recusa a solicitação (capitão+).
export async function declineJoinRequest(requestId: number): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/join-requests/${requestId}/decline`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.requestRespondError')));
  }
  return readContent<ClanActionResponse>(response);
}

// DELETE /clans/join-requests/{id} — cancela a minha própria solicitação.
export async function cancelJoinRequest(requestId: number): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/join-requests/${requestId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.requestCancelError')));
  }
  return readContent<ClanActionResponse>(response);
}
