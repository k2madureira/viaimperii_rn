import { apiFetch, readContent, readError } from '../config/defaultApi';

export type MissionStatus = 'available' | 'in_progress' | 'pending_review' | 'completed';

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
  // Preenchidos apenas enquanto status === 'pending_review' (janela de revisão).
  completable_at: string | null;
  remaining_seconds: number | null;
  approvals_count: number;
  approvals_required: number;
  // Preenchido apenas quando status === 'completed' (data/hora da finalização, UTC).
  completed_at: string | null;
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
  status: 'pending_review' | 'completed';
  completable_at: string | null;
  remaining_seconds: number | null;
  approvals_required: number;
  approvals_count: number;
  xp_earned: number;
  mastery_earned: Record<string, number>;
  total_xp: number;
  current_rank: string | null;
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

export interface MissionSort {
  sortField: 'completed_at' | 'difficulty';
  sortOrder: 'asc' | 'desc';
}

export async function getMissions(
  status?: MissionStatus,
  sort?: MissionSort,
): Promise<PaginatedMissions> {
  const parts = ['page=1', 'perPage=100'];
  if (status) parts.push(`status=${status}`);
  if (sort) parts.push(`sortField=${sort.sortField}`, `sortOrder=${sort.sortOrder}`);
  const response = await apiFetch(`/missions?${parts.join('&')}`);

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

// ── Revisão de missões (aprovação de pares) ───────────────────────────────────

export interface RankMini {
  id: number;
  name: string;
  image: string | null;
}

export interface ActiveAvatar {
  id: number;
  name: string;
  slug: string;
  url: string | null;
  type: string;
}

export interface ToReviewExecutor {
  id: string;
  name: string;
  rank: RankMini | null;
  image: string | null; // foto de perfil / avatar do OAuth
  active_avatar: ActiveAvatar | null; // avatar cosmético equipado
  legion_id: number | null;
}

export interface ToReviewItem {
  mission_slug: string;
  mission_name: string;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  specialty_id: number | null;
  xp_reward: number;
  executor: ToReviewExecutor;
  completable_at: string | null;
  remaining_seconds: number | null;
  approvals_count: number;
  approvals_required: number;
}

interface ToReviewResponse {
  page: number;
  perPage: number;
  totalItems: number;
  items: ToReviewItem[];
}

export interface ApproveMissionResult extends CompleteMissionResult {
  reviewer_xp_earned: number;
}

export async function getMissionsToReview(): Promise<ToReviewItem[]> {
  const response = await apiFetch(
    '/missions/to-review?page=1&perPage=100&sortField=remaining_seconds&sortOrder=asc',
  );

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões para revisão'));
  }

  const data = await readContent<ToReviewResponse>(response);
  return data.items ?? [];
}

export async function approveMission(slug: string, executorId: string): Promise<ApproveMissionResult> {
  const response = await apiFetch(`/missions/${slug}/approve`, {
    method: 'POST',
    body: JSON.stringify({ executor_id: executorId }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao aprovar missão'));
  }

  return readContent<ApproveMissionResult>(response);
}
