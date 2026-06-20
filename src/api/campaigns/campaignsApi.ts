import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface Campaign {
  id: string;
  name: string;
  required_missions: string[];
  reward_xp: number;
  reward_medal: string;
}

export async function getCampaigns(): Promise<Campaign[]> {
  const response = await apiFetch('/campaigns');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar campanhas'));
  }

  const data = await readContent<Campaign[] | { items: Campaign[] }>(response);
  return Array.isArray(data) ? data : (data?.items ?? []);
}
