import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { Achievement } from '../../api/users/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useSpecialties } from '../missions/model/queries/useSpecialties';

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();
  const profileQuery = useUserProfile(user?.user_id);
  const specialtiesQuery = useSpecialties();

  const achievements = profileQuery.data?.achievements ?? [];
  const specialties = specialtiesQuery.data ?? [];

  const unlocked = achievements.filter((a) => a.achieved_at);
  // null = todas as especialidades; number = filtrada
  const [filterSpecialtyId, setFilterSpecialtyId] = useState<number | null>(null);

  const visibleAchievements =
    filterSpecialtyId == null
      ? achievements
      : achievements.filter((a) => a.specialty_id === filterSpecialtyId);

  const visibleUnlocked = visibleAchievements.filter((a) => a.achieved_at);
  const visibleLocked = visibleAchievements.filter((a) => !a.achieved_at);

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar />

      <View className="px-5 pt-4 pb-1">
        <Text className="text-[13px] text-[#888]">
          {t('achievements.progress', {
            unlocked: unlocked.length,
            total: achievements.length,
          })}
        </Text>
      </View>

      {/* Filtro por especialidade */}
      {specialties.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: 8 }}>
          <TouchableOpacity
            onPress={() => setFilterSpecialtyId(null)}
            activeOpacity={0.8}
            className={`px-3 py-1.5 rounded-full border ${filterSpecialtyId == null ? 'bg-primary-500 border-primary-500' : 'bg-white border-[#e0dada]'}`}>
            <Text className={`text-[12px] font-bold ${filterSpecialtyId == null ? 'text-white' : 'text-[#666]'}`}>
              {t('achievements.filterAll')}
            </Text>
          </TouchableOpacity>
          {specialties.map((s) => {
            const active = filterSpecialtyId === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setFilterSpecialtyId(active ? null : s.id)}
                activeOpacity={0.8}
                className={`px-3 py-1.5 rounded-full border ${active ? 'bg-primary-500 border-primary-500' : 'bg-white border-[#e0dada]'}`}>
                <Text className={`text-[12px] font-bold ${active ? 'text-white' : 'text-[#666]'}`}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {profileQuery.isLoading ? (
        <View className="py-16 items-center">
          <ActivityIndicator color="#9E1B32" />
        </View>
      ) : profileQuery.isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text className="text-[13px] text-[#888] text-center">{t('achievements.loadError')}</Text>
          <TouchableOpacity
            onPress={() => profileQuery.refetch()}
            className="bg-primary-500 rounded-[12px] px-5 py-2.5">
            <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={profileQuery.isFetching}
              onRefresh={() => profileQuery.refetch()}
              tintColor="#9E1B32"
            />
          }>
          {visibleUnlocked.map((a) => (
            <AchievementRow key={a.id} achievement={a} unlocked t={t} />
          ))}
          {visibleLocked.length > 0 && (
            <Text className="text-[12px] font-bold text-[#aaa] uppercase tracking-[1px] mt-3 mb-1">
              {t('achievements.toUnlock')}
            </Text>
          )}
          {visibleLocked.map((a) => (
            <AchievementRow key={a.id} achievement={a} unlocked={false} t={t} />
          ))}
          {visibleAchievements.length === 0 && (
            <View className="py-12 items-center">
              <Text className="text-[14px] text-[#bbb]">{t('achievements.emptyFilter')}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function AchievementRow({
  achievement,
  unlocked,
  t,
}: {
  achievement: Achievement;
  unlocked: boolean;
  t: (key: string) => string;
}) {
  return (
    <View
      className={`flex-row items-center rounded-[14px] border p-3.5 ${unlocked ? 'bg-white border-[#f0eded]' : 'bg-[#f6f6f6] border-[#eee]'}`}>
      <View className="w-12 h-12 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden mr-3">
        {achievement.icon_url ? (
          achievement.icon_url.endsWith('.svg') ? (
            <SvgUri
              uri={achievement.icon_url}
              width={36}
              height={36}
              style={{ opacity: unlocked ? 1 : 0.3 }}
            />
          ) : (
            <Image
              source={{ uri: achievement.icon_url }}
              style={{ width: 36, height: 36, opacity: unlocked ? 1 : 0.3 }}
              resizeMode="contain"
            />
          )
        ) : (
          <Text className="text-[20px]" style={{ opacity: unlocked ? 1 : 0.3 }}>
            🏅
          </Text>
        )}
      </View>
      <View className="flex-1">
        <Text
          className={`text-[14px] font-bold ${unlocked ? 'text-charcoal' : 'text-[#999]'}`}
          numberOfLines={1}>
          {achievement.name}
        </Text>
        {achievement.description ? (
          <Text className="text-[12px] text-[#999]" numberOfLines={2}>
            {achievement.description}
          </Text>
        ) : null}
      </View>
      <View className="items-end ml-2">
        <Text className={`text-[12px] font-bold ${unlocked ? 'text-accent-500' : 'text-[#bbb]'}`}>
          +{achievement.xp_reward} {t('common.xp')}
        </Text>
        {unlocked && <Text className="text-[10px] text-laurel font-semibold mt-0.5">{t('achievements.obtained')}</Text>}
      </View>
    </View>
  );
}
