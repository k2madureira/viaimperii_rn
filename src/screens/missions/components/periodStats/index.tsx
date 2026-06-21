import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { UserStats } from '../../../../api/users/userApi';

interface Props {
  stats: UserStats | undefined;
  isLoading: boolean;
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-[18px] font-extrabold text-white">{value.toLocaleString('pt-BR')}</Text>
      <Text className="text-[10px] text-white/50 mt-0.5 text-center">{label}</Text>
    </View>
  );
}

export default function PeriodStats({ stats, isLoading }: Props) {
  return (
    <View className="bg-[#6B1221] rounded-[14px] p-4">
      <Text className="text-[10px] font-bold text-white/40 tracking-[2px] uppercase">
        XP no período
      </Text>

      {isLoading || !stats ? (
        <View className="py-4 items-center">
          <ActivityIndicator color="#D4AF37" />
        </View>
      ) : (
        <>
          <Text className="text-[30px] font-extrabold text-gold mt-1">
            {stats.xp_in_period.toLocaleString('pt-BR')}
            <Text className="text-[14px] font-bold text-white/30"> XP</Text>
          </Text>

          <View className="h-3" />
          <View className="flex-row border-t border-white/10 pt-3">
            <Metric value={stats.missions_completed} label="Missões" />
            <Metric value={stats.achievements_unlocked} label="Conquistas" />
            <Metric value={stats.ranks_gained} label="Patentes" />
            <Metric value={stats.active_days} label="Dias ativos" />
          </View>
        </>
      )}
    </View>
  );
}
