import { apiFetch, readContent, readError } from '../config/defaultApi';
import { DailyReward } from './dto';

// GET /daily-rewards?lang= — paginado { page, perPage, totalItems, language, items }.
export async function getDailyRewards(lang?: string): Promise<DailyReward[]> {
  const query = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const response = await apiFetch(`/daily-rewards${query}`);
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar os prêmios'));
  }
  const data = await readContent<{ items: DailyReward[] } | DailyReward[]>(response);
  return Array.isArray(data) ? data : data.items ?? [];
}
