import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanActionResponse, ClanInviteInput } from './dto';

// POST /clans/{id}/invites — convida um usuário (capitão+). Resolve pelo @handle ou
// user_id. 403 sem permissão; 409 auto-convite/já-em-clã/cheio/cooldown/pendente;
// 429 cap diário de convites.
export async function inviteToClan(
  clanId: number,
  input: ClanInviteInput,
): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/${clanId}/invites`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.inviteError')));
  }
  return readContent<ClanActionResponse>(response);
}
