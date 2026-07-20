import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ClaimDailyRewardResult } from './dto';

// POST /daily-rewards/{slug}/claim — resgata as ações não resgatadas de hoje
// (opcional {count}). 409 se não houver nada resgatável.
export async function claimDailyReward(
  slug: string,
  count?: number,
): Promise<ClaimDailyRewardResult> {
  const response = await apiFetch(`/daily-rewards/${slug}/claim`, {
    method: 'POST',
    body: JSON.stringify(count != null ? { count } : {}),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao resgatar o prêmio'));
  }
  return readContent<ClaimDailyRewardResult>(response);
}
