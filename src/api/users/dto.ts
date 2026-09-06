export interface CompletedMission {
  mission_id: string;
  completed_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  rank: string;
  total_xp: number;
  main_specialty: string | null;
  mastery: Record<string, number>;
  completed_missions: CompletedMission[];
  medals: string[];
  completed_campaigns: string[];
  created_at: string;
}

export interface RankImage {
  id: number;
  name: string;
  level: number;
  icon_url: string | null;
  image_url: string | null;
  thumb_url: string | null; // webp leve (256px) p/ listas/grids
}

// Asset cosmético equipado (avatar) — retornado no login e no detail do usuário.
export interface UserAsset {
  id: number;
  name: string;
  slug: string;
  url: string | null;
  thumb_url: string | null; // webp leve p/ listas/ícones
  type: string;
  is_free: boolean;
  price: number;
}

// Patente atual + dados de progressão (calculados no backend, cientes da trilha).
export interface CurrentRank extends RankImage {
  total_xp: number;
  current_rank_xp: number; // XP acumulado para alcançar a patente atual
  xp_in_current_rank: number; // XP dentro da faixa da patente atual
  current_rank_span: number; // largura da faixa (0 na patente máxima)
  next_rank_name: string | null;
  next_rank_xp: number | null; // XP acumulado para a próxima patente
  xp_to_next_rank: number;
  progress_pct: number; // progresso dentro da faixa, 0..100
}

export interface Achievement {
  id: number;
  name: string;
  description: string | null;
  xp_reward: number;
  specialty_id: number | null;
  icon_url: string | null;
  achieved_at: string | null;
}

export interface UserTrack {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface UserLegion {
  id: number;
  name: string;
  symbol: string | null;
  description: string | null;
  image_url: string | null;
  thumb_url: string | null; // webp leve (256px) p/ listas/grids
  specialty_id: number | null;
}

export interface UserCountry {
  id: number;
  name: string;
  icon_url: string | null;
}

export interface UserProvince {
  id: number;
  name: string;
  abbreviation: string | null;
  country_id: number | null;
  // O detalhe do usuário aninha o country (com ícone) — opcional p/ segurança.
  country?: UserCountry | null;
}

export interface GetUserResponse {
  user: UserProfile;
  xp_to_next_rank: number;
  xp_in_current_rank: number;
  current_rank_span: number;
  next_rank_name: string | null;
  must_choose_track: boolean;
  // Founder Access (§34). Opcionais p/ compat com backend antigo.
  is_founder?: boolean;
  founder_number?: number | null;
  track: UserTrack | null;
  legion: UserLegion | null;
  province: UserProvince | null;
  current_rank: CurrentRank | null;
  ranks: RankImage[];
  achievements: Achievement[];
  active_avatar: UserAsset | null;
}

export type StatsPeriod = 'weekly' | 'monthly' | 'annual' | 'all';

export interface UserStats {
  period: string;
  start_date: string | null;
  end_date: string | null;
  total_xp: number;
  current_rank: string;
  medals_count: number;
  missions_in_progress: number;
  missions_completed_total: number;
  xp_in_period: number;
  missions_completed: number;
  campaigns_completed: number;
  achievements_unlocked: number;
  ranks_gained: number;
  active_days: number;
  xp_by_source: Record<string, number>;
}

// ── Resumo de atividade do usuário logado (GET /users/me/summary) ─────────────
// Buckets de calendário SP; chaves sempre 0-filled (ver docs/users/activity-summary).
export interface UserActivitySummary {
  period: string;
  completedMissions: { easy: number; medium: number; hard: number };
  completedSpecialties: Record<string, number>; // chaves em minúsculas
  coins: { aureus: number; denarius: number; as: number }; // ganho no período (contagens)
  rewards: { xp: number; denarius: number };
}
