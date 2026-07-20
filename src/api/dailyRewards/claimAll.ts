import { ClaimDailyRewardResult } from './dto';
import { claimDailyReward } from './claim';

// Resgata todos os slugs informados (um POST por prêmio). Usa allSettled para
// tolerar 409 pontual (algo virou não-resgatável entre a listagem e o clique).
export async function claimAllDailyRewards(
  slugs: string[],
): Promise<PromiseSettledResult<ClaimDailyRewardResult>[]> {
  return Promise.allSettled(slugs.map((s) => claimDailyReward(s)));
}
