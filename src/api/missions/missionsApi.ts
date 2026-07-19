import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LoginStreak } from '../auth/authApi';

export type MissionStatus = 'available' | 'in_progress' | 'pending_review' | 'completed';

// Tipo de evidência exigida para concluir a missão.
export type ProofType = 'none' | 'link' | 'image' | 'text' | 'any';

export interface Mission {
  id: number;
  slug: string;
  name: string;
  type: 'daily' | 'monthly' | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  xp_reward: number;
  mastery_reward: number;
  // Preview do que a missão paga em moeda ao completar (valor atômico, em "asses").
  // Não é o valor efetivamente creditado — isso só existe após a finalização.
  coin_reward: number;
  coin_reward_display: string;
  specialty_id: number | null;
  specialty_name: string | null;
  specialty_color: string | null; // cor da especialidade (#RRGGBB) — badge/ícone
  track_id: number | null;
  // Prioridade no catálogo: 0 = comum, 1 = universal (missão de trilha, hábito
  // diário genérico). Universais lideram as listagens; as `easy` concluem na hora.
  priority: number;
  // true quando a missão pertence a uma das profissões ativas do usuário.
  matched_profession?: boolean;
  status: MissionStatus;
  proof_type: ProofType;
  acceptance_criteria: string | null;
  // Tags temáticas derivadas da cópia (migration 0049); sempre presente ([] quando sem tema).
  tags: string[];
  // Preenchidos apenas enquanto status === 'pending_review' (janela de revisão).
  completable_at: string | null;
  remaining_seconds: number | null;
  approvals_count: number;
  approvals_required: number;
  // Preenchidos apenas quando status === 'completed' (creditados na finalização).
  completed_at: string | null;
  xp_earned: number | null;
  mastery_earned: number | null;
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
  professionId?: number,
): Promise<PaginatedMissions> {
  const parts = ['page=1', 'perPage=100'];
  if (status) parts.push(`status=${status}`);
  if (sort) parts.push(`sortField=${sort.sortField}`, `sortOrder=${sort.sortOrder}`);
  // Missões de profissão (opt-in): só aparecem quando filtradas pela profissão ativa.
  if (professionId != null) parts.push(`professionId=${professionId}`);
  const response = await apiFetch(`/missions?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões'));
  }

  const data = await readContent<PaginatedMissions | Mission[]>(response);
  return Array.isArray(data)
    ? { page: 1, perPage: data.length, totalItems: data.length, items: data }
    : data;
}

// Status ao vivo de UMA missão (finaliza na leitura se a janela já venceu).
// Usado para pollar uma missão específica após o /complete.
export async function getMission(slug: string): Promise<Mission> {
  const response = await apiFetch(`/missions/${slug}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar a missão'));
  }

  return readContent<Mission>(response);
}

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

export async function getAvailableMissions(
  specialtyId?: number,
  difficulty?: MissionDifficulty,
  page = 1,
  perPage = 50,
  professionId?: number,
): Promise<PaginatedMissions> {
  const parts = [`page=${page}`, `perPage=${perPage}`];
  if (specialtyId != null) parts.push(`specialtyId=${specialtyId}`);
  if (difficulty != null) parts.push(`difficulty=${difficulty}`);
  // Restringe às missões da profissão ativa (422 no backend se não for do usuário).
  if (professionId != null) parts.push(`professionId=${professionId}`);

  const response = await apiFetch(`/missions/available?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões disponíveis'));
  }

  return readContent<PaginatedMissions>(response);
}

// ── Missões recomendadas (content-based, GET /missions/recommended) ───────────

// Missão do feed de recomendação: além dos campos base, traz o resultado do
// ranqueamento (score 0..1, motivos em PT-BR e tags que casaram com o perfil).
export interface RecommendedMission extends Mission {
  score: number;
  reasons: string[];
  matched_tags: string[];
}

export interface RecommendedMissions {
  page: number;
  perPage: number;
  totalItems: number;
  // false em cold start (usuário sem histórico) — ordem padrão do catálogo, sem score.
  personalized: boolean;
  items: RecommendedMission[];
  availableMissions?: MissionAllowance;
}

export async function getRecommendedMissions(
  specialtyId?: number,
  difficulty?: MissionDifficulty,
  type?: 'daily' | 'monthly',
  page = 1,
  perPage = 50,
): Promise<RecommendedMissions> {
  const parts = [`page=${page}`, `perPage=${perPage}`];
  if (specialtyId != null) parts.push(`specialtyId=${specialtyId}`);
  if (difficulty != null) parts.push(`difficulty=${difficulty}`);
  if (type != null) parts.push(`type=${type}`);

  const response = await apiFetch(`/missions/recommended?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões recomendadas'));
  }

  return readContent<RecommendedMissions>(response);
}

// ── Briefing do dia (B2, GET /missions/daily-briefing) ────────────────────────
// Uma chamada que compõe sugeridas + meta + streak + bônus ativo p/ o hero da Home.

export interface DailyBriefingActiveBonus {
  streak_bonus_pct: number;
  rewarded_video_available: boolean;
}

export interface DailyBriefing {
  date: string;
  personalized: boolean;
  suggested_missions: RecommendedMission[];
  goal: MissionAllowance;
  streak: LoginStreak;
  active_bonus: DailyBriefingActiveBonus;
}

export async function getDailyBriefing(suggestions = 3): Promise<DailyBriefing> {
  const response = await apiFetch(`/missions/daily-briefing?suggestions=${suggestions}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar o briefing do dia'));
  }

  return readContent<DailyBriefing>(response);
}

export async function startMission(slug: string): Promise<void> {
  const response = await apiFetch(`/missions/${slug}/start`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao iniciar missão'));
  }
}

export interface AbandonMissionResult {
  message: string;
  mission_slug: string;
  status: string;
}

// Desiste de uma missão já aceita (in_progress ou pending_review) — sem afetar XP.
export async function abandonMission(slug: string): Promise<AbandonMissionResult> {
  const response = await apiFetch(`/missions/${slug}/abandon`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao desistir da missão'));
  }

  return readContent<AbandonMissionResult>(response);
}

export async function registerRewardedVideo(): Promise<RewardedVideoResult> {
  const response = await apiFetch('/missions/rewarded-video', { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao registrar vídeo assistido'));
  }

  return readContent<RewardedVideoResult>(response);
}

// Evidência enviada no pedido de conclusão (conforme o proof_type da missão).
export interface MissionEvidence {
  link?: string;
  text?: string;
  image_key?: string; // key retornada por presignUpload + upload ao S3
}

export async function completeMission(
  slug: string,
  evidence?: MissionEvidence,
): Promise<CompleteMissionResult> {
  const response = await apiFetch(`/missions/${slug}/complete`, {
    method: 'POST',
    body: JSON.stringify(evidence ?? {}),
  });

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
  thumb: string | null; // webp leve (256px) p/ badge de patente
}

export interface ActiveAvatar {
  id: number;
  name: string;
  slug: string;
  url: string | null;
  thumb_url: string | null; // webp leve p/ listas/ícones
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

// Evidência submetida pelo executor, exibida ao revisor.
export interface MissionSubmission {
  kind: 'link' | 'image' | 'text';
  content: string | null; // URL do link ou texto livre
  image_url: string | null; // presigned GET temporário (objeto privado)
  submitted_at: string | null;
}

export interface ToReviewItem {
  mission_slug: string;
  mission_name: string;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  specialty_id: number | null;
  xp_reward: number;
  acceptance_criteria: string | null;
  executor: ToReviewExecutor;
  submission: MissionSubmission | null;
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

export interface RejectMissionResult {
  message: string;
  mission_slug: string;
  status: string;
}

export async function rejectMission(
  slug: string,
  executorId: string,
  reason?: string,
): Promise<RejectMissionResult> {
  const response = await apiFetch(`/missions/${slug}/reject`, {
    method: 'POST',
    body: JSON.stringify({ executor_id: executorId, reason: reason ?? null }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao rejeitar missão'));
  }

  return readContent<RejectMissionResult>(response);
}
