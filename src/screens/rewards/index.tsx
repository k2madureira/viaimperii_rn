import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { CoinAmount } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';
import { DailyReward } from '../../api/rewards/dailyRewardsApi';
import { useDailyRewards } from './model/queries/useDailyRewards';
import { useClaimAllDailyRewards, useClaimDailyReward } from './model/mutations/useClaimDailyReward';
import { useWallet } from '../dashboard/model/queries/useWallet';
import WalletButton from '../dashboard/components/walletButton';

// Emoji por tipo de ação (extensível conforme o backend adicionar action_keys).
const ACTION_EMOJI: Record<string, string> = {
  post_comment: '💬',
  feed_reaction: '👍',
  post_created: '✍️',
  mission_completed: '⚔️',
};

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();

  const rewardsQuery = useDailyRewards(!!user);
  const walletQuery = useWallet(!!user);
  const claimM = useClaimDailyReward();
  const claimAllM = useClaimAllDailyRewards();
  // A listagem já traz só regras ativas — não filtrar por is_active (não vem no item).
  const rewards = rewardsQuery.data ?? [];
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
  const claimingAll = claimAllM.isPending;

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar
        rightExtra={walletQuery.data ? <WalletButton balance={walletQuery.data.balance} /> : null}
      />

      {rewardsQuery.isLoading ? (
        <View className="py-16 items-center">
          <ActivityIndicator color="#9E1B32" />
        </View>
      ) : rewardsQuery.isError ? (
        <View className="flex-1 items-center justify-center px-8 gap-3">
          <Text className="text-[13px] text-[#888] text-center">{t('rewards.loadError')}</Text>
          <TouchableOpacity
            onPress={() => rewardsQuery.refetch()}
            className="bg-primary-500 rounded-[12px] px-5 py-2.5">
            <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 14 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={rewardsQuery.isFetching}
              onRefresh={() => rewardsQuery.refetch()}
              tintColor="#9E1B32"
            />
          }>
          <View>
            <Text className="text-[22px] font-extrabold text-charcoal">{t('rewards.title')}</Text>
            <Text className="text-[13px] text-[#888] mt-1 leading-[18px]">
              {t('rewards.subtitle')}
            </Text>
          </View>

          {/* Resgatar tudo — mostra o valor total que será creditado */}
          {totalUnits > 0 && (
            <TouchableOpacity
              disabled={claimingAll}
              activeOpacity={0.9}
              onPress={() => claimAllM.mutate(claimable.map((r) => r.slug))}
              className={`rounded-[16px] px-4 py-3.5 flex-row items-center justify-between ${
                claimingAll ? 'bg-laurel/60' : 'bg-laurel'
              }`}>
              <View>
                <Text className="text-[14px] font-extrabold text-white">{t('rewards.claimAll')}</Text>
                <Text className="text-[11px] text-white/70 mt-0.5">
                  {t('rewards.claimAllCount', { n: totalUnits })}
                </Text>
              </View>
              {claimingAll ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center gap-2">
                  {totalCoins > 0 && <CoinAmount atomic={totalCoins} size={14} textColor="#fff" />}
                  {totalXp > 0 && (
                    <Text className="text-[13px] font-extrabold text-white">
                      +{totalXp}
                      {t('common.xp')}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          )}

          {rewards.length === 0 ? (
            <View className="bg-white border border-[#f0eded] rounded-[16px] py-12 items-center px-6">
              <Text className="text-[28px] mb-2">🎁</Text>
              <Text className="text-[13px] text-[#999] text-center">{t('rewards.empty')}</Text>
            </View>
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
      )}
    </View>
  );
}

function RewardCard({
  reward: r,
  claiming,
  onClaim,
}: {
  reward: DailyReward;
  claiming: boolean;
  onClaim: () => void;
}) {
  const { t } = useTranslation();
  const cap = r.max_per_day;
  const earned = Math.min(r.actions_done_today, cap);
  const canClaim = r.claimable > 0;
  const capReached = r.claimed_today >= cap;
  const pct = cap > 0 ? Math.min(100, (earned / cap) * 100) : 0;

  return (
    <View className="bg-white border border-[#f0eded] rounded-[16px] p-4">
      <View className="flex-row items-start">
        <View className="w-11 h-11 rounded-[12px] bg-accent-500/10 items-center justify-center mr-3">
          <Text className="text-[20px]">{ACTION_EMOJI[r.action_key] ?? '🎁'}</Text>
        </View>
        <View className="flex-1 pr-2">
          <Text className="text-[14px] font-bold text-charcoal">
            {r.name || t(`rewards.actions.${r.action_key}`, { defaultValue: r.action_key })}
          </Text>
          {r.description ? (
            <Text className="text-[11px] text-[#999] mt-0.5 leading-[15px]">{r.description}</Text>
          ) : null}
          {/* Recompensa por unidade */}
          <View className="flex-row items-center gap-1 mt-0.5">
            {r.reward_type === 'xp' ? (
              <Text className="text-[12px] font-extrabold text-accent-500">
                +{r.reward_amount}
                {t('common.xp')}
              </Text>
            ) : (
              <CoinAmount atomic={r.reward_amount} size={12} textColor="#9a7b1f" />
            )}
            <Text className="text-[11px] text-[#aaa]">{t('rewards.perAction')}</Text>
          </View>
        </View>
      </View>

      {/* Progresso do dia */}
      <View className="mt-3 gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] text-[#888]">{t('rewards.today', { done: earned, cap })}</Text>
          <Text className="text-[11px] text-[#aaa]">{t('rewards.claimedLabel', { n: r.claimed_today })}</Text>
        </View>
        <View className="h-1.5 bg-[#f0eded] rounded-full overflow-hidden">
          <View className="h-full bg-accent-500 rounded-full" style={{ width: `${pct}%` }} />
        </View>
      </View>

      {/* Ação */}
      <TouchableOpacity
        disabled={!canClaim || claiming}
        activeOpacity={0.85}
        onPress={onClaim}
        className={`mt-3 rounded-[12px] py-3 items-center ${
          canClaim && !claiming ? 'bg-primary-500' : 'bg-[#efeaea]'
        }`}>
        {claiming ? (
          <ActivityIndicator color="#9E1B32" size="small" />
        ) : (
          <Text
            className={`text-[13px] font-bold ${canClaim ? 'text-white' : 'text-[#aaa]'}`}>
            {canClaim
              ? t('rewards.claim', { n: r.claimable })
              : capReached
                ? t('rewards.capReached')
                : t('rewards.doMore')}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
