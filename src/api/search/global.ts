import { apiFetch, readContent, readError } from '../config/defaultApi';
import { GlobalSearchResponse } from './dto';

const EMPTY: GlobalSearchResponse = { users: [], hashtags: [], posts: [] };

/**
 * `GET /search?q=&limit=` — busca única com smart search (accent/case-insensitive,
 * exato > prefixo > substring > fuzzy). `q` mínimo 2 chars; cada seção capada por
 * `limit` (1–20). Tolerante ao formato de resposta.
 */
export async function globalSearch(q: string, limit = 10): Promise<GlobalSearchResponse> {
  const term = q.trim();
  if (term.length < 2) return EMPTY;

  const response = await apiFetch(
    `/search?q=${encodeURIComponent(term)}&limit=${limit}`,
  );
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro na busca'));
  }

  const data = await readContent<Partial<GlobalSearchResponse>>(response);
  return {
    users: data?.users ?? [],
    hashtags: data?.hashtags ?? [],
    posts: data?.posts ?? [],
  };
}
