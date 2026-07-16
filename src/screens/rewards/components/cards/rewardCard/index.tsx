import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CoinAmount } from '../../../../../components/icons';
import { DailyReward } from '../../../../../api/rewards/dailyRewardsApi';
import { ACTION_EMOJI } from '../../../../../constants/rewards';

interface Props {
  reward: DailyReward;
  claiming: boolean;
  onClaim: () => void;
}

export default function RewardCard({ reward: r, claiming, onClaim }: Props) {
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
          <Text className={`text-[13px] font-bold ${canClaim ? 'text-white' : 'text-[#aaa]'}`}>
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
