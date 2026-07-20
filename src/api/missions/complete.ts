import { apiFetch, readContent, readError } from '../config/defaultApi';
import { CompleteMissionResult, MissionEvidence } from './dto';

export async function completeMission(
  slug: string,
  evidence?: MissionEvidence,
): Promise<CompleteMissionResult> {
  const response = await apiFetch(`/missions/${slug}/complete`, {
    method: 'POST',
    body: JSON.stringify(evidence ?? {}),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao concluir missão'));
  }

  return readContent<CompleteMissionResult>(response);
}
