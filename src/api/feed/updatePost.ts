import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FeedItem, UpdatePostInput } from './dto';

export async function updatePost(eventId: number, input: UpdatePostInput): Promise<FeedItem> {
  const response = await apiFetch(`/feed/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao editar publicação'));
  }

  return readContent<FeedItem>(response);
}
