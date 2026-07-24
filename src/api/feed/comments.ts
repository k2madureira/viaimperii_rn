import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FeedComment, FeedCommentsResponse } from './dto';

export async function getFeedComments(
  eventId: number,
  cursor?: number | null,
  perPage = 20,
): Promise<FeedCommentsResponse> {
  const parts = [`perPage=${perPage}`];
  if (cursor != null) parts.push(`cursor=${cursor}`);
  const response = await apiFetch(`/feed/${eventId}/comments?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar comentários'));
  }

  return readContent<FeedCommentsResponse>(response);
}

export async function createComment(
  eventId: number,
  body: string,
  parentId?: number | null,
): Promise<FeedComment> {
  const response = await apiFetch(`/feed/${eventId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body, parent_id: parentId ?? null }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao comentar'));
  }

  return readContent<FeedComment>(response);
}
