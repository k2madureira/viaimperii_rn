import { apiFetch, readContent, readError } from '../config/defaultApi';
import { DailyBriefing } from './dto';

export async function getDailyBriefing(suggestions = 3): Promise<DailyBriefing> {
  const response = await apiFetch(`/missions/daily-briefing?suggestions=${suggestions}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar o briefing do dia'));
  }

  return readContent<DailyBriefing>(response);
}
