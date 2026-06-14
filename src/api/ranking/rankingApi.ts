import { apiFetch } from '../config/defaultApi';

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
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? error.message ?? 'Erro ao carregar o ranking');
  }

  const json = await response.json();
  return (json.content ?? json) as RankingResponse;
}
