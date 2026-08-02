import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanActionResponse } from './dto';

// POST /clans/{id}/members/{uid}/promote — promove +1 divisão (oficial, major+).
export async function promoteMember(
  clanId: number,
  userId: string,
): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/${clanId}/members/${userId}/promote`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.manageError')));
  }
  return readContent<ClanActionResponse>(response);
}

// POST /clans/{id}/members/{uid}/demote — rebaixa −1 divisão (oficial, major+).
export async function demoteMember(
  clanId: number,
  userId: string,
): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/${clanId}/members/${userId}/demote`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.manageError')));
  }
  return readContent<ClanActionResponse>(response);
}

// DELETE /clans/{id}/members/{uid} — expulsa um membro (oficial, estritamente abaixo).
export async function kickMember(
  clanId: number,
  userId: string,
): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/${clanId}/members/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.manageError')));
  }
  return readContent<ClanActionResponse>(response);
}
