import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ApproveMissionResult } from './dto';

export async function approveMission(slug: string, executorId: string): Promise<ApproveMissionResult> {
  const response = await apiFetch(`/missions/${slug}/approve`, {
    method: 'POST',
    body: JSON.stringify({ executor_id: executorId }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao aprovar missão'));
  }

  return readContent<ApproveMissionResult>(response);
}
