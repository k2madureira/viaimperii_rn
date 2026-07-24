import { apiFetch, readContent, readError } from '../config/defaultApi';
import { SendMissionTributeInput, TributeApiError, TributeResult } from './dto';

// POST /missions/{slug}/tribute — transfere moedas ao executor de uma conclusão.
// 409 quando a missão do executor ainda não está COMPLETED; demais erros iguais
// ao tributo de feed.
export async function sendMissionTribute({
  missionSlug,
  executorId,
  amount,
  unit = 'denarius',
}: SendMissionTributeInput): Promise<TributeResult> {
  const response = await apiFetch(`/missions/${missionSlug}/tribute`, {
    method: 'POST',
    body: JSON.stringify({ executor_id: executorId, amount, unit }),
  });

  if (!response.ok) {
    throw new TributeApiError(
      response.status,
      await readError(response, 'Erro ao enviar o tributo'),
    );
  }

  return readContent<TributeResult>(response);
}
