import { apiFetch, readContent, readError } from '../config/defaultApi';
import { StatsPeriod, UserStats } from './dto';

export async function getUserStats(
  userId: string,
  period: StatsPeriod = 'all',
): Promise<UserStats> {
  const query = period !== 'all' ? `?period=${period}` : '';
  const response = await apiFetch(`/users/${userId}/stats${query}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar estatísticas'));
  }

  return readContent<UserStats>(response);
}
