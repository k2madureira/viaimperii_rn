import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanDetail } from './dto';

// POST /clans/{id}/emblem — define o emblema/ícone do clã (só marechal). O
// `imageKey` vem de um presign com purpose=clan (objeto PÚBLICO). `null` limpa o emblema.
export async function setClanEmblem(
  clanId: number,
  imageKey: string | null,
): Promise<ClanDetail> {
  const response = await apiFetch(`/clans/${clanId}/emblem`, {
    method: 'POST',
    body: JSON.stringify({ image_key: imageKey }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.toasts.emblemError')));
  }
  return readContent<ClanDetail>(response);
}
