import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { ErrorState, SpecialtyFilterBar } from './components';
import { AchievementsHeader, AchievementsList } from './components/sections';

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const profileQuery = useUserProfile(user?.user_id);

  const achievements = profileQuery.data?.achievements ?? [];
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

      <AchievementsHeader unlocked={unlocked.length} total={achievements.length} />

      <SpecialtyFilterBar value={filterSpecialtyId} onChange={setFilterSpecialtyId} />

      {profileQuery.isLoading ? (
        <View className="py-16 items-center">
          <ActivityIndicator color="#9E1B32" />
        </View>
      ) : profileQuery.isError ? (
        <ErrorState onRetry={() => profileQuery.refetch()} />
      ) : (
        <AchievementsList
          unlocked={visibleUnlocked}
          locked={visibleLocked}
          refreshing={profileQuery.isFetching}
          onRefresh={() => profileQuery.refetch()}
          bottomInset={insets.bottom}
        />
      )}
    </View>
  );
}
