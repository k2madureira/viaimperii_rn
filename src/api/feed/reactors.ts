import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ReactionType, ReactorsResponse } from './dto';

export async function getReactors(
  eventId: number,
  type?: ReactionType | null,
  cursor?: number | null,
  perPage = 20,
): Promise<ReactorsResponse> {
  const parts = [`perPage=${perPage}`];
  if (type) parts.push(`type=${type}`);
  if (cursor != null) parts.push(`cursor=${cursor}`);
  const response = await apiFetch(`/feed/${eventId}/reactions?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar reações'));
  }

  return readContent<ReactorsResponse>(response);
}
