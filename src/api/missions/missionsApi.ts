import { apiFetch, readContent, readError } from '../config/defaultApi';

export type MissionStatus = 'available' | 'in_progress' | 'completed';

export interface Mission {
  id: number;
  slug: string;
  name: string;
  type: 'daily' | 'monthly' | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  xp_reward: number;
  mastery_reward: number;
  specialty_id: number | null;
  specialty_name: string | null;
  track_id: number | null;
  status: MissionStatus;
}

export interface CompleteMissionResult {
  message: string;
  mission_slug: string;
  xp_earned: number;
  mastery_earned: Record<string, number>;
  total_xp: number;
  current_rank: string;
  promoted: boolean;
  previous_rank?: string;
  medal_earned?: string;
}

export interface PaginatedMissions {
  page: number;
  perPage: number;
  totalItems: number;
  items: Mission[];
}

export async function getMissions(status?: MissionStatus): Promise<Mission[]> {
  const statusParam = status ? `&status=${status}` : '';
  const response = await apiFetch(`/missions?page=1&perPage=100${statusParam}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões'));
  }

  // O endpoint retorna PaginatedMissions ({ items }); mantemos compatibilidade
  // caso volte a ser uma lista.
  const data = await readContent<PaginatedMissions | Mission[]>(response);
  return Array.isArray(data) ? data : (data?.items ?? []);
}

export async function getAvailableMissions(
  specialtyId?: number,
  page = 1,
  perPage = 50,
): Promise<PaginatedMissions> {
  const parts = [`page=${page}`, `perPage=${perPage}`];
  if (specialtyId != null) parts.push(`specialtyId=${specialtyId}`);

  const response = await apiFetch(`/missions/available?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões disponíveis'));
  }

  return readContent<PaginatedMissions>(response);
}

export async function startMission(slug: string): Promise<void> {
  const response = await apiFetch(`/missions/${slug}/start`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao iniciar missão'));
  }
}

export async function completeMission(slug: string): Promise<CompleteMissionResult> {
  const response = await apiFetch(`/missions/${slug}/complete`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao concluir missão'));
  }

  return readContent<CompleteMissionResult>(response);
}
