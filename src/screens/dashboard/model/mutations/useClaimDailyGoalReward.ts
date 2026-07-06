import { useMutation, useQueryClient } from '@tanstack/react-query';
import { grantReward } from '../../../../api/rewards/rewardsApi';
import { DAILY_GOAL_REWARD_DENARIUS } from '../../../../constants/game';

/**
 * Credita o bônus da meta diária (20 denários) via POST /rewards.
 *
 * O backend é idempotente por dia SP (replay não re-credita), então o cliente
 * pode chamar sem guard local. Em sucesso, invalida a carteira p/ refletir o saldo.
 */
export function useClaimDailyGoalReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      grantReward({ type: 'coins', amount: DAILY_GOAL_REWARD_DENARIUS, unit: 'denarius' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}
