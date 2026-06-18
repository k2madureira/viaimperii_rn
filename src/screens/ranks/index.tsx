import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { XP_PER_RANK } from '../../constants/game';
import { HomeNavigationProp } from '../../navigation/HomeStack';
import { RankCard } from '../dashboard/components';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';

export default function RanksScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNavigationProp>();
  const { user } = useAuth();

  const profileQuery = useUserProfile(user?.user_id);
  const profile = profileQuery.data?.user;
  const currentRank = profileQuery.data?.current_rank ?? null;
  const ranks = profileQuery.data?.ranks ?? [];

  const rank = profile?.rank ?? user?.rank ?? '—';
  const totalXp = profile?.total_xp ?? user?.total_xp ?? 0;
  const xpToNextRank = profileQuery.data?.xp_to_next_rank ?? 0;
  const currentLevel = currentRank?.level ?? 0;

  const sortedRanks = [...ranks].sort((a, b) => a.level - b.level);

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#f0f0f0]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="pr-3">
          <Text className="text-[24px] text-[#333] leading-none">‹</Text>
        </TouchableOpacity>
        <Text
          className="text-sm font-semibold text-[#111] tracking-[3px]"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          PATENTES
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 20 }}
        showsVerticalScrollIndicator={false}>
        {/* Patente atual (igual à home) */}
        <RankCard
          rank={rank}
          totalXp={totalXp}
          xpToNextRank={xpToNextRank}
          imageUrl={currentRank?.image_url}
        />

        {/* Lista de todas as patentes */}
        <View>
          <Text className="text-[15px] font-extrabold text-[#111] mb-3">Todas as patentes</Text>

          <View className="bg-white border border-[#f0eded] rounded-[14px] overflow-hidden">
            {sortedRanks.map((r, idx) => {
              const xpRequired = (r.level - 1) * XP_PER_RANK;
              const isCurrent = r.level === currentLevel;
              const isAchieved = currentLevel > 0 && r.level <= currentLevel;

              return (
                <View
                  key={r.id}
                  className={`flex-row items-center px-4 py-3 ${idx > 0 ? 'border-t border-[#f4f1f1]' : ''} ${isCurrent ? 'bg-[#f4eaea]' : ''}`}>
                  {/* Imagem da patente */}
                  <View className="w-11 h-11 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden">
                    {r.image_url ? (
                      <Image
                        source={{ uri: r.image_url }}
                        style={{ width: 36, height: 36, opacity: isAchieved ? 1 : 0.35 }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text className="text-[12px] text-[#bbb] font-bold">{r.level}</Text>
                    )}
                  </View>

                  <View className="flex-1 ml-3">
                    <Text
                      className={`text-[14px] font-semibold ${isCurrent ? 'text-primary' : isAchieved ? 'text-[#222]' : 'text-[#999]'}`}>
                      {r.name}
                      {isCurrent ? ' · atual' : ''}
                    </Text>
                    <Text className="text-[11px] text-[#aaa]">Nível {r.level}</Text>
                  </View>

                  <View className="items-end">
                    <Text
                      className={`text-[13px] font-bold ${isAchieved ? 'text-[#333]' : 'text-[#bbb]'}`}>
                      {xpRequired.toLocaleString('pt-BR')} XP
                    </Text>
                    {isAchieved && !isCurrent && (
                      <Text className="text-[10px] text-primary font-semibold">conquistada</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
