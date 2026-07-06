import { apiFetch, readContent, readError } from '../config/defaultApi';

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

/**
 * Distribuição de XP/moeda dirigida pelo front (POST /rewards).
 *
 * Regras do backend (usuário comum): máx. 100 por request e 10 grants por dia (SP).
 * **Idempotente por dia SP**: um grant idêntico (mesmo ator, alvo, `type` e
 * `amount`) no mesmo dia é replay — retorna `idempotent: true` sem re-creditar e
 * sem consumir slot. Então o cliente pode chamar sem guard local; basta olhar
 * `idempotent` para saber se creditou de fato (ex.: exibir toast só na 1ª vez).
 */
export async function grantReward(payload: GrantRewardPayload): Promise<RewardResult> {
  const response = await apiFetch('/rewards', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao conceder recompensa'));
  }
  return readContent<RewardResult>(response);
}

export interface RewardsUsage {
  rewards_today: number | null;
  daily_limit: number | null;
  remaining: number | null;
  per_request_max: number | null;
}

/** Saldo de grants restante hoje (tudo null para admin). */
export async function getRewardsUsage(): Promise<RewardsUsage> {
  const response = await apiFetch('/rewards/usage');
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar uso de recompensas'));
  }
  return readContent<RewardsUsage>(response);
}
