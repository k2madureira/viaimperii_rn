import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FeedListResponse } from './dto';

/**
 * Todos os posts de uma hashtag (mais recentes primeiro, keyset por cursor=id).
 * `tag` é normalizado como as hashtags salvas (# opcional, minúsculo no backend).
 * Mesma audiência/shape de `getFeed`.
 */
export async function getHashtagFeed(
  tag: string,
  cursor?: number | null,
  perPage = 20,
): Promise<FeedListResponse> {
  const normalized = tag.replace(/^#/, '');
  const parts = [`perPage=${perPage}`];
  if (cursor != null) parts.push(`cursor=${cursor}`);
  const response = await apiFetch(
    `/feed/hashtag/${encodeURIComponent(normalized)}?${parts.join('&')}`,
  );

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar posts da hashtag'));
  }

  return readContent<FeedListResponse>(response);
}
