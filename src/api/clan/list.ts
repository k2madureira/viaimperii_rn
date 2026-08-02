import { apiFetch, readContent, readError } from '../config/defaultApi';
import i18n from '../../i18n';
import { ClanListParams, PaginatedClans } from './dto';

// GET /clans — diretório de clãs (smart search por nome/tag, paginado).
export async function getClans(params: ClanListParams = {}): Promise<PaginatedClans> {
  const { q, page = 1, perPage = 20 } = params;
  const search = new URLSearchParams();
  search.set('page', String(page));
  search.set('perPage', String(perPage));
  if (q && q.trim()) search.set('q', q.trim());

  const response = await apiFetch(`/clans?${search.toString()}`);
  if (!response.ok) {
    throw new Error(await readError(response, i18n.t('clan.loadError')));
  }
  return readContent<PaginatedClans>(response);
}
