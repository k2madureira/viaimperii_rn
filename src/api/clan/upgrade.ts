import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanActionResponse } from './dto';

// POST /clans/{id}/upgrade — sobe o nível de capacidade (só marechal, 403). 409 no
// teto; 422 se saldo pessoal do marechal insuficiente.
export async function upgradeClan(clanId: number): Promise<ClanActionResponse> {
  const response = await apiFetch(`/clans/${clanId}/upgrade`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.upgradeError')));
  }
  return readContent<ClanActionResponse>(response);
}
