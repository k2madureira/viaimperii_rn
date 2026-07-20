import { apiFetch, readContent, readError } from '../config/defaultApi';
import { StatsPeriod, UserActivitySummary } from './dto';

export async function getUserSummary(period: StatsPeriod = 'all'): Promise<UserActivitySummary> {
  const query = period !== 'all' ? `?period=${period}` : '';
  const response = await apiFetch(`/users/me/summary${query}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar o resumo'));
  }

  return readContent<UserActivitySummary>(response);
}
