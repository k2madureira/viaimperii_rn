import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { UserStats } from '../../../../api/users/userApi';

interface Props {
  stats: UserStats | undefined;
  isLoading: boolean;
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-[18px] font-extrabold text-white">{value.toLocaleString()}</Text>
      <Text className="text-[10px] text-white/50 mt-0.5 text-center">{label}</Text>
    </View>
  );
}

export default function PeriodStats({ stats, isLoading }: Props) {
  const { t } = useTranslation();
  return (
    <View className="bg-[#6B1221] rounded-[14px] p-4">
      <Text className="text-[10px] font-bold text-white/40 tracking-[2px] uppercase">
        {t('periodStats.xpInPeriod')}
      </Text>

      {isLoading || !stats ? (
        <View className="py-4 items-center">
          <ActivityIndicator color="#D4AF37" />
        </View>
      ) : (
        <>
          <Text className="text-[30px] font-extrabold text-gold mt-1">
            {stats.xp_in_period.toLocaleString()}
            <Text className="text-[14px] font-bold text-white/30"> {t('common.xp')}</Text>
          </Text>

          <View className="h-3" />
          <View className="flex-row border-t border-white/10 pt-3">
            <Metric value={stats.missions_completed} label={t('periodStats.missions')} />
            <Metric value={stats.achievements_unlocked} label={t('periodStats.achievements')} />
            <Metric value={stats.ranks_gained} label={t('periodStats.ranks')} />
            <Metric value={stats.active_days} label={t('periodStats.activeDays')} />
          </View>
        </>
      )}
    </View>
  );
}
