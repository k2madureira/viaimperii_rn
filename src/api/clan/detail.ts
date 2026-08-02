import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanDetail } from './dto';

// GET /clans/{id} — detalhe do clã (membros por divisão, info de upgrade). Membros e
// não-membros podem ler; `my_rank_level`/`my_division` vêm null para não-membros.
export async function getClan(clanId: number): Promise<ClanDetail> {
  const response = await apiFetch(`/clans/${clanId}`);
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.loadError')));
  }
  return readContent<ClanDetail>(response);
}
