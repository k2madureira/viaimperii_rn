import { apiFetch, readContent, readError } from '../config/defaultApi';
import { RewardedVideoResult } from './dto';

export async function registerRewardedVideo(): Promise<RewardedVideoResult> {
  const response = await apiFetch('/missions/rewarded-video', { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao registrar vídeo assistido'));
  }

  return readContent<RewardedVideoResult>(response);
}
