import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FeedItem } from './dto';

/**
 * Detalhe de um item do feed (post ou evento de sistema) — mesmo formato de um
 * item da timeline, com autor/reações resolvidos ao vivo. 404 se fora da
 * audiência do usuário.
 */
export async function getFeedEvent(eventId: number): Promise<FeedItem> {
  const response = await apiFetch(`/feed/${eventId}`);
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar a publicação'));
  }
  return readContent<FeedItem>(response);
}
