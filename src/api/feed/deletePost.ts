import { apiFetch, readError } from '../config/defaultApi';

export async function deletePost(eventId: number): Promise<void> {
  const response = await apiFetch(`/feed/${eventId}`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao excluir publicação'));
  }
}
