import { apiFetch, readError } from '../config/defaultApi';

export async function startMission(slug: string): Promise<void> {
  const response = await apiFetch(`/missions/${slug}/start`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao iniciar missão'));
  }
}
