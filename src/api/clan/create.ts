import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanActionResponse, CreateClanInput } from './dto';

// POST /clans — funda um clã. Exige patente ≥ 20 (403), não estar em outro clã /
// fora do cooldown (409) e saldo pessoal para a taxa de fundação (422).
export async function createClan(input: CreateClanInput): Promise<ClanActionResponse> {
  const response = await apiFetch('/clans', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    // 403 na fundação só acontece no rank-gate — troca o texto técnico do backend
    // ("requires rank index ≥ 20") por uma mensagem humana.
    if (response.status === 403) {
      throw new Error(i18n.t('clan.create.rankGate'));
    }
    throw new Error(await readError(response, i18n.t('clan.toasts.createError')));
  }
  return readContent<ClanActionResponse>(response);
}
