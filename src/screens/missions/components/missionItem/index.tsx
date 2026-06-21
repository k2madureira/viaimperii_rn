import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Mission } from '../../../../api/missions/missionsApi';

interface Props {
  mission: Mission;
  onStart: (slug: string) => void;
  onComplete: (slug: string) => void;
  pending: boolean;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#2F7A52',
  medium: '#D4AF37',
  hard: '#9E1B32',
};

export default function MissionItem({ mission, onStart, onComplete, pending }: Props) {
  const isCompleted = mission.status === 'completed';
  const isInProgress = mission.status === 'in_progress';
  const diffColor = DIFFICULTY_COLOR[mission.difficulty ?? ''] ?? '#aaa';

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
          <View className="flex-row items-center flex-wrap gap-x-2 mt-1.5">
            {mission.specialty_name && (
              <Text className="text-[11px] text-[#999]">{mission.specialty_name}</Text>
            )}
            {mission.difficulty && (
              <View
                className="px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${diffColor}18` }}>
                <Text className="text-[10px] font-bold" style={{ color: diffColor }}>
                  {DIFFICULTY_LABEL[mission.difficulty] ?? mission.difficulty}
                </Text>
              </View>
            )}
            {mission.type && (
              <Text className="text-[10px] text-[#bbb]">
                {mission.type === 'daily' ? 'Diária' : 'Semanal'}
              </Text>
            )}
          </View>
        </View>

        <View className="items-end gap-1">
          <Text className="text-[13px] font-extrabold text-gold">+{mission.xp_reward} XP</Text>
          {isCompleted && (
            <View className="bg-laurel/15 rounded-full px-2 py-0.5">
              <Text className="text-[10px] font-bold text-laurel">Concluída</Text>
            </View>
          )}
          {isInProgress && (
            <View className="bg-primary/10 rounded-full px-2 py-0.5">
              <Text className="text-[10px] font-bold text-primary">Em andamento</Text>
            </View>
          )}
        </View>
      </View>

      {!isCompleted && (
        <View className="mt-3">
          <TouchableOpacity
            disabled={pending}
            activeOpacity={0.85}
            onPress={() => isInProgress ? onComplete(mission.slug) : onStart(mission.slug)}
            className={`rounded-[10px] py-2.5 items-center ${
              isInProgress ? 'bg-primary' : 'bg-[#6B1221]'
            }`}>
            {pending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-[13px] font-bold text-white">
                {isInProgress ? 'Concluir missão' : 'Iniciar missão'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
