import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { RankingItem } from '../../../../api/ranking/rankingApi';

interface Props {
  ranking: RankingItem[] | undefined;
  isLoading: boolean;
  currentUserName?: string;
}

function positionBadge(position: number) {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return `${position}º`;
}

export default function RankingSection({ ranking, isLoading, currentUserName }: Props) {
  return (
    <View>
      <Text className="text-[15px] font-extrabold text-[#111] mb-3">Ranking Imperial</Text>

      <View className="bg-white border border-[#f0eded] rounded-[14px] p-2">
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#8B1A2B" />
          </View>
        ) : !ranking || ranking.length === 0 ? (
          <View className="py-8 items-center">
            <Text className="text-[13px] text-[#999]">Nenhum dado de ranking ainda.</Text>
          </View>
        ) : (
          ranking.map((item) => {
            const isMe = !!currentUserName && item.name.trim() === currentUserName.trim();
            return (
              <View
                key={`${item.position}-${item.name}`}
                className={`flex-row items-center px-3 py-2.5 rounded-[10px] ${isMe ? 'bg-[#f4eaea]' : ''}`}>
                <Text className="w-8 text-[13px] font-bold text-[#555]">
                  {positionBadge(item.position)}
                </Text>
                <View className="flex-1 ml-1">
                  <Text
                    className={`text-[13px] ${isMe ? 'font-extrabold text-primary' : 'font-semibold text-[#222]'}`}
                    numberOfLines={1}>
                    {item.name}
                    {isMe ? ' (você)' : ''}
                  </Text>
                  <Text className="text-[11px] text-[#999]">
                    {item.rank} · {item.main_specialty}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[12px] font-bold text-[#333]">
                    {item.total_xp.toLocaleString('pt-BR')} XP
                  </Text>
                  {item.total_medals > 0 && (
                    <Text className="text-[10px] text-[#aaa]">{item.total_medals} 🏅</Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
