export type RewardType = 'xp' | 'coins';
export type CoinUnit = 'aureus' | 'denarius' | 'as';

export interface GrantRewardPayload {
  type: RewardType;
  // XP em pontos; coins na denominação `unit`.
  amount: number;
  // Só para coins: denominação do `amount` (default no backend = "denarius").
  unit?: CoinUnit;
  // Alvo do grant; omitido = usuário logado. Outro user_id exige admin.
  user_id?: string;
}

export interface RewardResult {
  type: RewardType;
  amount: number;
  // true = replay de um grant idêntico já feito hoje (SP) — NÃO re-creditou.
  idempotent?: boolean;
  // Presentes quando type === 'xp'.
  total_xp?: number;
  current_rank?: string | null;
  promoted?: boolean;
  // Presentes quando type === 'coins'.
  balance?: number;
  balance_display?: string;
}

export interface RewardsUsage {
  rewards_today: number | null;
  daily_limit: number | null;
  remaining: number | null;
  per_request_max: number | null;
}
