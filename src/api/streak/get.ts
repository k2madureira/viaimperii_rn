import { apiFetch, readContent, readError } from '../config/defaultApi';
import { StreakApiError, StreakResponse } from './dto';

export async function getStreak(userId: string): Promise<StreakResponse> {
  const res = await apiFetch(`/users/${userId}/streak`);
  if (!res.ok) {
    throw new StreakApiError(res.status, await readError(res, 'Erro ao carregar a ofensiva'));
  }
  return readContent<StreakResponse>(res);
}
