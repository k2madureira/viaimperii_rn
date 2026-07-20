import { apiFetch, readContent, readError } from '../config/defaultApi';
import { AbandonMissionResult } from './dto';

// Desiste de uma missão já aceita (in_progress ou pending_review) — sem afetar XP.
export async function abandonMission(slug: string): Promise<AbandonMissionResult> {
  const response = await apiFetch(`/missions/${slug}/abandon`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao desistir da missão'));
  }

  return readContent<AbandonMissionResult>(response);
}
