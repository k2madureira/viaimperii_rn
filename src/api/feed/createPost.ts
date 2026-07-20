import { apiFetch, readContent, readError } from '../config/defaultApi';
import { CreatePostInput, FeedItem } from './dto';

export async function createPost(input: CreatePostInput): Promise<FeedItem> {
  const response = await apiFetch('/feed', {
    method: 'POST',
    body: JSON.stringify({ scope: 'global', ...input }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao publicar'));
  }

  return readContent<FeedItem>(response);
}
