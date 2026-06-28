import React from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { Achievement } from '../../api/users/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();
  const profileQuery = useUserProfile(user?.user_id);

  const achievements = profileQuery.data?.achievements ?? [];
  const unlocked = achievements.filter((a) => a.achieved_at);
  const locked = achievements.filter((a) => !a.achieved_at);

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

      {profileQuery.isLoading ? (
        <View className="py-16 items-center">
          <ActivityIndicator color="#9E1B32" />
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
          {unlocked.map((a) => (
            <AchievementRow key={a.id} achievement={a} unlocked t={t} />
          ))}
          {locked.length > 0 && (
            <Text className="text-[12px] font-bold text-[#aaa] uppercase tracking-[1px] mt-3 mb-1">
              {t('achievements.toUnlock')}
            </Text>
          )}
          {locked.map((a) => (
            <AchievementRow key={a.id} achievement={a} unlocked={false} t={t} />
          ))}
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
