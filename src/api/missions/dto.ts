import { LoginStreak } from '../auth';

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

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

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

export interface AbandonMissionResult {
  message: string;
  mission_slug: string;
  status: string;
}

// Evidência enviada no pedido de conclusão (conforme o proof_type da missão).
export interface MissionEvidence {
  link?: string;
  text?: string;
  image_key?: string; // key retornada por presignUpload + upload ao S3
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

export interface ToReviewResponse {
  page: number;
  perPage: number;
  totalItems: number;
  items: ToReviewItem[];
}

export interface ApproveMissionResult extends CompleteMissionResult {
  reviewer_xp_earned: number;
}

export interface RejectMissionResult {
  message: string;
  mission_slug: string;
  status: string;
}
