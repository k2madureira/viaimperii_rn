import React, { useEffect, useRef, useState } from 'react';
import ScreenContainer from '../../components/screenContainer';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { RankCard } from '../dashboard/components';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useTracks } from './model/queries/useTracks';
import { useRanks } from './model/queries/useRanks';
import { RanksHeader, RanksList, TrackSelector } from './components/sections';

export default function RanksScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const profileQuery = useUserProfile(user?.user_id);
  const profile = profileQuery.data?.user;
  const currentRank = profileQuery.data?.current_rank ?? null;
  const userTrack = profileQuery.data?.track ?? null;

  const rank = profile?.rank ?? user?.rank ?? '—';
  const totalXp = profile?.total_xp ?? user?.total_xp ?? 0;
  const xpToNextRank = profileQuery.data?.xp_to_next_rank ?? 0;
  const currentLevel = currentRank?.level ?? 0;

  const tracksQuery = useTracks();
  const tracks = tracksQuery.data ?? [];

  const [trackId, setTrackId] = useState<number | null>(null);

  // Seleciona a trilha do usuário por padrão; senão, a primeira da lista.
  useEffect(() => {
    if (trackId != null || tracks.length === 0) return;
    setTrackId(userTrack?.id ?? tracks[0].id);
  }, [tracks, userTrack, trackId]);

  const ranksQuery = useRanks(trackId, trackId != null);
  const sortedRanks = [...(ranksQuery.data ?? [])].sort((a, b) => a.level - b.level);

  const scrollRef = useRef<ScrollView>(null);
  const currentRankY = useRef<number | null>(null);

  // Scroll automático até a patente atual após carregar a lista.
  useEffect(() => {
    if (ranksQuery.isLoading || sortedRanks.length === 0 || currentLevel === 0) return;
    const timer = setTimeout(() => {
      if (currentRankY.current != null) {
        scrollRef.current?.scrollTo({ y: Math.max(0, currentRankY.current - 120), animated: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [ranksQuery.isLoading, sortedRanks.length, currentLevel]);

  return (
    <ScreenContainer>
      <RanksHeader />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={ranksQuery.isFetching || profileQuery.isFetching}
            onRefresh={() => {
              ranksQuery.refetch();
              profileQuery.refetch();
            }}
            tintColor="#9E1B32"
          />
        }>
        {/* Patente atual (igual à home) + trilha do usuário */}
        <RankCard
          rank={rank}
          totalXp={totalXp}
          xpToNextRank={xpToNextRank}
          progressPct={currentRank?.progress_pct}
          imageUrl={currentRank?.image_url}
          trackName={userTrack?.name}
        />

        <TrackSelector tracks={tracks} value={trackId} onChange={setTrackId} />

        <RanksList
          ranks={sortedRanks}
          currentLevel={currentLevel}
          userTrack={userTrack}
          isLoading={ranksQuery.isLoading}
          isError={ranksQuery.isError}
          onRetry={() => ranksQuery.refetch()}
          onCurrentLayout={(e) => {
            currentRankY.current = e.nativeEvent.layout.y;
          }}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
