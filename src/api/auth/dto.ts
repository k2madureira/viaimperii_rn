export interface LoginStreak {
  current_streak: number;
  longest_streak: number;
  last_login_date: string | null;
  timezone: string;
  bonus_pct: number;
  next_milestone: number;
  max_streak_days: number;
  is_max_bonus: boolean;
  // Streak Shields (consumível anti-decay). Respostas antigas de login podem não
  // trazê-los — tratar `undefined` como 0 até a query dedicada resolver (spec §9).
  streak_shields?: number;
  max_streak_shields?: number;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  email: string;
  name: string;
  is_admin: boolean;
  is_temporary_password: boolean;
  rank: string;
  total_xp: number;
  main_specialty: string | null;
  mastery: Record<string, number>;
  medals: string[];
  completed_missions: unknown[];
  completed_campaigns: string[];
  legion_id: number | null;
  province_id: number | null;
  streak?: LoginStreak | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  invite_code?: string;
}

export interface CreateUserResponse {
  message: string;
  user: { id: string; name: string; rank: string; main_specialty: string | null };
  is_temporary_password: boolean;
  specialty_test_code: string | null;
}

export interface VerifyTokenResponse {
  user_id: string;
}

// Ticket efêmero (single-use, ~60s) para abrir UM stream SSE. Gerar um novo por
// conexão e a cada reconexão. Substitui o `?token=<jwt>` legado (deprecado).
export interface SseTicketResponse {
  ticket: string;
  expires_in: number;
}
