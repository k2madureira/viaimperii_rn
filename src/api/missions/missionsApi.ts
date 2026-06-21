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

export interface RecommendedLegion {
  id: number;
  name: string;
  image_url: string | null;
  reason: 'theme' | 'correlated' | string;
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
  requires_legion_selection?: boolean;
  recommended_legions?: RecommendedLegion[];
  requires_track_selection?: boolean;
}

export interface MissionAllowance {
  date: string;
  daily: number;
  weekly: number;
  daily_reset_at: string;
  weekly_reset_at: string;
  rewarded_video_available: boolean;
}

export interface RewardedVideoResult {
  message: string;
  bonus_missions: number;
  availableMissions: MissionAllowance;
}

export interface PaginatedMissions {
  page: number;
  perPage: number;
  totalItems: number;
  items: Mission[];
  availableMissions?: MissionAllowance;
}

export async function getMissions(status?: MissionStatus): Promise<PaginatedMissions> {
  const statusParam = status ? `&status=${status}` : '';
  const response = await apiFetch(`/missions?page=1&perPage=100${statusParam}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões'));
  }

  const data = await readContent<PaginatedMissions | Mission[]>(response);
  return Array.isArray(data)
    ? { page: 1, perPage: data.length, totalItems: data.length, items: data }
    : data;
}

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

export async function getAvailableMissions(
  specialtyId?: number,
  difficulty?: MissionDifficulty,
  page = 1,
  perPage = 50,
): Promise<PaginatedMissions> {
  const parts = [`page=${page}`, `perPage=${perPage}`];
  if (specialtyId != null) parts.push(`specialtyId=${specialtyId}`);
  if (difficulty != null) parts.push(`difficulty=${difficulty}`);

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

export async function registerRewardedVideo(): Promise<RewardedVideoResult> {
  const response = await apiFetch('/missions/rewarded-video', { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao registrar vídeo assistido'));
  }

  return readContent<RewardedVideoResult>(response);
}

export async function completeMission(slug: string): Promise<CompleteMissionResult> {
  const response = await apiFetch(`/missions/${slug}/complete`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao concluir missão'));
  }

  return readContent<CompleteMissionResult>(response);
}
