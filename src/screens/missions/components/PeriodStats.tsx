import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { UserStats } from '../../../api/users/userApi';

interface Props {
  stats: UserStats | undefined;
  isLoading: boolean;
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-[18px] font-extrabold text-[#111]">{value.toLocaleString('pt-BR')}</Text>
      <Text className="text-[10px] text-[#999] mt-0.5 text-center">{label}</Text>
    </View>
  );
}

export default function PeriodStats({ stats, isLoading }: Props) {
  return (
    <View className="bg-white border border-[#f0eded] rounded-[14px] p-4">
      <Text className="text-[11px] font-semibold text-[#999] tracking-[1px] uppercase">
        XP no período
      </Text>
      <View className="h-1" />

      {isLoading || !stats ? (
        <View className="py-4 items-center">
          <ActivityIndicator color="#8B1A2B" />
        </View>
      ) : (
        <>
          <Text className="text-[26px] font-extrabold text-primary">
            {stats.xp_in_period.toLocaleString('pt-BR')}
            <Text className="text-[13px] font-bold text-[#bbb]"> XP</Text>
          </Text>

          <View className="h-3" />
          <View className="flex-row border-t border-[#f4f1f1] pt-3">
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
