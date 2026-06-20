import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Mission } from '../../../../api/missions/missionsApi';

interface Props {
  mission: Mission;
  onStart: (slug: string) => void;
  onComplete: (slug: string) => void;
  pending: boolean;
}

const STATUS_LABEL: Record<Mission['status'], string> = {
  available: 'Disponível',
  in_progress: 'Em andamento',
  completed: 'Concluída',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

export default function MissionItem({ mission, onStart, onComplete, pending }: Props) {
  const isCompleted = mission.status === 'completed';
  const isInProgress = mission.status === 'in_progress';

  return (
    <View
      className={`border rounded-[14px] p-4 ${
        isInProgress
          ? 'border-primary bg-[#fdf7f8]'
          : isCompleted
            ? 'border-laurel/30 bg-[#f4faf6]'
            : 'border-[#f0eded] bg-white'
      }`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[14px] font-bold text-[#222]">{mission.name}</Text>
          <View className="flex-row items-center flex-wrap gap-x-2 mt-1">
            <Text className="text-[11px] text-[#999]">
              {mission.specialty_name ?? 'Geral'}
            </Text>
            {mission.difficulty && (
              <Text className="text-[11px] text-[#999]">
                · {DIFFICULTY_LABEL[mission.difficulty] ?? mission.difficulty}
              </Text>
            )}
            {mission.type && (
              <Text className="text-[11px] text-[#999]">
                · {mission.type === 'daily' ? 'Diária' : 'Mensal'}
              </Text>
            )}
          </View>
        </View>
        <View className="items-end">
          <Text className="text-[13px] font-bold text-primary">+{mission.xp_reward} XP</Text>
          <Text
            className={`text-[10px] font-semibold mt-0.5 ${
              isInProgress ? 'text-primary' : isCompleted ? 'text-laurel' : 'text-[#aaa]'
            }`}>
            {STATUS_LABEL[mission.status]}
          </Text>
        </View>
      </View>

      {!isCompleted && (
        <View className="mt-3">
          <TouchableOpacity
            disabled={pending}
            activeOpacity={0.85}
            onPress={() =>
              isInProgress ? onComplete(mission.slug) : onStart(mission.slug)
            }
            className={`rounded-[10px] py-2.5 items-center ${isInProgress ? 'bg-primary' : 'bg-[#f4eaea]'}`}>
            {pending ? (
              <ActivityIndicator color={isInProgress ? '#fff' : '#8B1A2B'} size="small" />
            ) : (
              <Text
                className={`text-[13px] font-bold ${isInProgress ? 'text-white' : 'text-primary'}`}>
                {isInProgress ? 'Concluir' : 'Iniciar'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
