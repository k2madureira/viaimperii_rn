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
