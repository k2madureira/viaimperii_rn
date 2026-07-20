import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ReactResponse } from './dto';

export async function unreactFeed(eventId: number): Promise<ReactResponse> {
  const response = await apiFetch(`/feed/${eventId}/react`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao remover reação'));
  }

  return readContent<ReactResponse>(response);
}
