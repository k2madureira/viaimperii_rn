import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useLegions } from '../missions/model/queries/useLegions';
import { ErrorState, ImagePreloader, LegionSkeleton } from './components';
import { LegionBadges } from './components/sections';

export default function LegionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const profileQuery = useUserProfile(user?.user_id);
  const userLegion = profileQuery.data?.legion ?? null;

  const legionsQuery = useLegions();
  const legions = legionsQuery.data ?? [];

  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const totalImages = legions.filter((l) => l.thumb_url ?? l.image_url).length;

  const handleImageLoad = useCallback(() => {
    setLoadedCount((prev) => {
      const next = prev + 1;
      if (next >= totalImages && totalImages > 0) setAllImagesLoaded(true);
      return next;
    });
  }, [totalImages]);

  const showSkeleton = legionsQuery.isLoading || (!allImagesLoaded && legions.length > 0);

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: insets.bottom + 32,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={legionsQuery.isFetching || profileQuery.isFetching}
            onRefresh={() => {
              setLoadedCount(0);
              setAllImagesLoaded(false);
              legionsQuery.refetch();
              profileQuery.refetch();
            }}
            tintColor="#9E1B32"
          />
        }>
        {showSkeleton && <LegionSkeleton />}

        {!allImagesLoaded && legions.length > 0 && (
          <ImagePreloader legions={legions} onImageSettled={handleImageLoad} />
        )}

        {!showSkeleton && legionsQuery.isError && (
          <ErrorState onRetry={() => legionsQuery.refetch()} />
        )}

        {!showSkeleton && !legionsQuery.isError && legions.length > 0 && (
          <LegionBadges
            legions={legions}
            userLegionId={userLegion?.id ?? null}
            userHasLegion={userLegion != null}
            totalXp={profileQuery.data?.user?.total_xp ?? user?.total_xp ?? 0}
            userId={user?.user_id}
          />
        )}
      </ScrollView>
    </View>
  );
}
