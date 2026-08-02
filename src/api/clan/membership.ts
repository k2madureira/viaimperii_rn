import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanActionResponse } from './dto';

// POST /clans/{id}/leave — sair do clã. Marechal com outros membros → auto-sucessão;
// marechal último membro → clã dissolvido. Aplica cooldown de troca.
export async function leaveClan(clanId: number): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/${clanId}/leave`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.leaveError')));
  }
  return readContent<ClanActionResponse>(response);
}

// POST /clans/{id}/transfer — transfere o comando a outro membro (só marechal). O
// marechal de saída permanece como general.
export async function transferClan(
  clanId: number,
  userId: string,
): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/${clanId}/transfer`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.manageError')));
  }
  return readContent<ClanActionResponse>(response);
}
