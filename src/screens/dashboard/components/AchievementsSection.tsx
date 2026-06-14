import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Achievement } from '../../../api/users/userApi';

interface Props {
  achievements: Achievement[];
}

export default function AchievementsSection({ achievements }: Props) {
  if (!achievements || achievements.length === 0) {
    return null;
  }

  // Mais recentes primeiro
  const sorted = [...achievements].sort((a, b) => {
    const ta = a.achieved_at ? new Date(a.achieved_at).getTime() : 0;
    const tb = b.achieved_at ? new Date(b.achieved_at).getTime() : 0;
    return tb - ta;
  });

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-[15px] font-extrabold text-[#111]">Conquistas</Text>
        <Text className="text-[12px] text-[#999]">{achievements.length}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
        {sorted.map((ach) => (
          <View
            key={ach.id}
            className="w-[96px] bg-white border border-[#f0eded] rounded-[14px] p-3 items-center">
            <View className="w-12 h-12 items-center justify-center">
              {ach.icon_url ? (
                <SvgUri width={44} height={44} uri={ach.icon_url} />
              ) : (
                <View className="w-11 h-11 rounded-full bg-[#f4eaea]" />
              )}
            </View>
            <View className="h-2" />
            <Text className="text-[10px] font-semibold text-[#333] text-center leading-[13px]" numberOfLines={2}>
              {ach.name}
            </Text>
            {ach.xp_reward > 0 && (
              <Text className="text-[9px] text-primary font-bold mt-1">+{ach.xp_reward} XP</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
