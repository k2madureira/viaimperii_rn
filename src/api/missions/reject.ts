import { apiFetch, readContent, readError } from '../config/defaultApi';
import { RejectMissionResult } from './dto';

export async function rejectMission(
  slug: string,
  executorId: string,
  reason?: string,
): Promise<RejectMissionResult> {
  const response = await apiFetch(`/missions/${slug}/reject`, {
    method: 'POST',
    body: JSON.stringify({ executor_id: executorId, reason: reason ?? null }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao rejeitar missão'));
  }

  return readContent<RejectMissionResult>(response);
}
