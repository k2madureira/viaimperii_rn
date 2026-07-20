import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FeedListResponse, FeedView } from './dto';

export async function getFeed(
  scope: FeedView = 'home',
  cursor?: number | null,
  perPage = 20,
): Promise<FeedListResponse> {
  const parts = [`scope=${scope}`, `perPage=${perPage}`];
  if (cursor != null) parts.push(`cursor=${cursor}`);
  const response = await apiFetch(`/feed?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar o feed'));
  }

  return readContent<FeedListResponse>(response);
}
