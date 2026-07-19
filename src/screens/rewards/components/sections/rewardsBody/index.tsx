import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { DailyReward } from '../../../../../api/rewards/dailyRewardsApi';
import {
  useClaimAllDailyRewards,
  useClaimDailyReward,
} from '../../../model/mutations/useClaimDailyReward';
import ClaimAllButton from '../../buttons/claimAllButton';
import RewardCard from '../../cards/rewardCard';
import EmptyBox from '../../feedback/emptyBox';
import RewardsHeader from '../rewardsHeader';

interface Props {
  rewards: DailyReward[];
  refreshing: boolean;
  onRefresh: () => void;
  bottomInset: number;
}

// Corpo da tela: cabeçalho + "resgatar tudo" + lista de recompensas diárias.
export default function RewardsBody({ rewards, refreshing, onRefresh, bottomInset }: Props) {
  const claimM = useClaimDailyReward();
  const claimAllM = useClaimAllDailyRewards();
  const claimingSlug = claimM.isPending ? claimM.variables?.slug ?? null : null;

  // Totais resgatáveis (para o botão "Resgatar tudo").
  const claimable = rewards.filter((r) => r.claimable > 0);
  const totalUnits = claimable.reduce((s, r) => s + r.claimable, 0);
  const totalCoins = claimable
    .filter((r) => r.reward_type === 'coins')
    .reduce((s, r) => s + r.claimable * r.reward_amount, 0);
  const totalXp = claimable
    .filter((r) => r.reward_type === 'xp')
    .reduce((s, r) => s + r.claimable * r.reward_amount, 0);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, paddingBottom: bottomInset + 24, gap: 14 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9E1B32" />
      }>
      <RewardsHeader />

      <ClaimAllButton
        totalUnits={totalUnits}
        totalCoins={totalCoins}
        totalXp={totalXp}
        claiming={claimAllM.isPending}
        onPress={() => claimAllM.mutate(claimable.map((r) => r.slug))}
      />

      {rewards.length === 0 ? (
        <EmptyBox />
      ) : (
        rewards.map((r) => (
          <RewardCard
            key={r.slug}
            reward={r}
            claiming={claimingSlug === r.slug}
            onClaim={() => claimM.mutate({ slug: r.slug })}
          />
        ))
      )}
    </ScrollView>
  );
}
