import { apiFetch, readContent, readError } from '../config/defaultApi';

// Erro do domínio de streak que carrega o status HTTP, para o front distinguir
// os estados de UI (teto de escudos vs. saldo insuficiente vs. sessão).
export class StreakApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'StreakApiError';
    this.status = status;
  }
}

// GET /users/{id}/streak — fonte fresca da contagem de escudos (reflete compra).
export interface StreakResponse {
  current_streak: number;
  longest_streak: number;
  last_login_date: string | null;
  timezone: string;
  bonus_pct: number;
  next_milestone: number;
  max_streak_days: number;
  is_max_bonus: boolean;
  streak_shields: number;
  max_streak_shields: number;
  shield_price: number; // atômico (asses)
  shield_price_display: string;
}

// POST /users/{id}/streak/shield — resposta da compra de 1 escudo.
export interface BuyShieldResponse {
  message: string;
  streak_shields: number;
  max_streak_shields: number;
  price: number; // atômico (asses)
  price_display: string;
  coin_balance: number; // atômico (asses)
  coin_balance_display: string;
}

export async function getStreak(userId: string): Promise<StreakResponse> {
  const res = await apiFetch(`/users/${userId}/streak`);
  if (!res.ok) {
    throw new StreakApiError(res.status, await readError(res, 'Erro ao carregar a ofensiva'));
  }
  return readContent<StreakResponse>(res);
}

export async function buyStreakShield(userId: string): Promise<BuyShieldResponse> {
  const res = await apiFetch(`/users/${userId}/streak/shield`, { method: 'POST' });
  if (!res.ok) {
    throw new StreakApiError(res.status, await readError(res, 'Erro ao comprar o escudo'));
  }
  return readContent<BuyShieldResponse>(res);
}
