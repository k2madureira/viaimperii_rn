import { apiFetch, readContent, readError } from '../config/defaultApi';

export type DailyRewardType = 'xp' | 'coins';

// Item do catálogo de prêmios diários + progresso do usuário no dia (SP).
// A listagem retorna só regras ATIVAS (sem `is_active`) com `name` já localizado.
export interface DailyReward {
  slug: string;
  name: string; // localizado por ?lang=
  description?: string;
  action_key: string; // post_comment | feed_reaction | post_created | mission_completed | …
  reward_type: DailyRewardType;
  reward_amount: number; // canônico: XP em pontos; coins em valor atômico (asses)
  reward_amount_display?: string;
  max_per_day: number;
  actions_done_today: number;
  claimed_today: number;
  claimable: number; // max(0, min(actions_done_today, max_per_day) − claimed_today)
}

// GET /daily-rewards?lang= — paginado { page, perPage, totalItems, language, items }.
export async function getDailyRewards(lang?: string): Promise<DailyReward[]> {
  const query = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const response = await apiFetch(`/daily-rewards${query}`);
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar os prêmios'));
  }
  const data = await readContent<{ items: DailyReward[] } | DailyReward[]>(response);
  return Array.isArray(data) ? data : data.items ?? [];
}

export interface ClaimDailyRewardResult {
  slug?: string;
  claimed?: number; // unidades resgatadas nesta chamada
  reward_type?: DailyRewardType;
  amount?: number;
  total_xp?: number;
  current_rank?: string | null;
  promoted?: boolean;
  balance?: number;
}

// POST /daily-rewards/{slug}/claim — resgata as ações não resgatadas de hoje
// (opcional {count}). 409 se não houver nada resgatável.
export async function claimDailyReward(
  slug: string,
  count?: number,
): Promise<ClaimDailyRewardResult> {
  const response = await apiFetch(`/daily-rewards/${slug}/claim`, {
    method: 'POST',
    body: JSON.stringify(count != null ? { count } : {}),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao resgatar o prêmio'));
  }
  return readContent<ClaimDailyRewardResult>(response);
}

// Resgata todos os slugs informados (um POST por prêmio). Usa allSettled para
// tolerar 409 pontual (algo virou não-resgatável entre a listagem e o clique).
export async function claimAllDailyRewards(
  slugs: string[],
): Promise<PromiseSettledResult<ClaimDailyRewardResult>[]> {
  return Promise.allSettled(slugs.map((s) => claimDailyReward(s)));
}
