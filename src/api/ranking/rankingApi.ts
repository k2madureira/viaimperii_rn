import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface RankingItem {
  position: number;
  name: string;
  rank: string;
  total_xp: number;
  main_specialty: string;
  total_medals: number;
  medals: string[];
}

export interface RankingResponse {
  ranking: RankingItem[];
}

export async function getRanking(): Promise<RankingResponse> {
  const response = await apiFetch('/ranking');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar o ranking'));
  }

  return readContent<RankingResponse>(response);
}
