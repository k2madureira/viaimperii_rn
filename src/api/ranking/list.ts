import { apiFetch, readContent, readError } from '../config/defaultApi';
import { RankingResponse } from './dto';

export async function getRanking(): Promise<RankingResponse> {
  const response = await apiFetch('/ranking');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar o ranking'));
  }

  return readContent<RankingResponse>(response);
}
