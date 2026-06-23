import { apiFetch, readContent, readError } from '../config/defaultApi';

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
  specialty_id: number | null;
  specialty_name: string | null;
  track_id: number | null;
  status: MissionStatus;
  proof_type: ProofType;
  acceptance_criteria: string | null;
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

// ── Upload de evidência (imagem) ──────────────────────────────────────────────

export type EvidenceContentType = 'image/jpeg' | 'image/png' | 'image/webp';

interface PresignResult {
  upload_url: string;
  key: string;
  expires_in: number;
}

export async function presignEvidenceUpload(contentType: EvidenceContentType): Promise<PresignResult> {
  const response = await apiFetch('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ content_type: contentType }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao preparar o envio da imagem'));
  }
  return readContent<PresignResult>(response);
}

/**
 * Faz upload do arquivo local direto ao S3 via presigned PUT e retorna a `key`
 * para enviar como `image_key` no /complete. O PUT vai direto ao bucket (sem auth).
 */
export async function uploadEvidenceImage(
  localUri: string,
  contentType: EvidenceContentType,
): Promise<string> {
  const { upload_url, key } = await presignEvidenceUpload(contentType);
  const blob = await (await fetch(localUri)).blob();
  const put = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!put.ok) {
    throw new Error('Falha ao enviar a imagem para o armazenamento.');
  }
  return key;
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
