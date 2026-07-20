import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ReactionType, ReactResponse } from './dto';

export async function reactFeed(eventId: number, type: ReactionType): Promise<ReactResponse> {
  const response = await apiFetch(`/feed/${eventId}/react`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao reagir'));
  }

  return readContent<ReactResponse>(response);
}
