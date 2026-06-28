import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LockIcon } from '../../components/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { HomeNavigationProp } from '../../navigation/HomeStack';
import { RankCard } from '../dashboard/components';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useTracks } from './model/queries/useTracks';
import { useRanks } from './model/queries/useRanks';

// Recruta IV (nível 4) é a patente em que o usuário escolhe a trilha.
const CHOICE_RANK_LEVEL = 4;

export default function RanksScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
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
          {t('ranks.title')}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={ranksQuery.isFetching || profileQuery.isFetching}
            onRefresh={() => { ranksQuery.refetch(); profileQuery.refetch(); }}
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

        {/* Seleção de trilha */}
        {tracks.length > 0 && (
          <View className="flex-row bg-[#f0eded] rounded-[12px] p-1">
            {tracks.map((t) => {
              const active = t.id === trackId;
              return (
                <TouchableOpacity
                  key={t.id}
                  activeOpacity={0.85}
                  onPress={() => setTrackId(t.id)}
                  className={`flex-1 py-2.5 rounded-[9px] items-center ${active ? 'bg-white' : ''}`}>
                  <Text
                    className={`text-[13px] font-bold ${active ? 'text-primary-500' : 'text-[#888]'}`}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Lista de todas as patentes da trilha */}
        <View>
          <Text className="text-[15px] font-extrabold text-[#111] mb-3">{t('ranks.allRanks')}</Text>

          {ranksQuery.isLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator color="#8B1A2B" />
            </View>
          ) : ranksQuery.isError ? (
            <View className="py-10 items-center gap-3">
              <Text className="text-[13px] text-[#888] text-center">{t('ranks.loadError')}</Text>
              <TouchableOpacity
                onPress={() => ranksQuery.refetch()}
                className="bg-primary-500 rounded-[12px] px-5 py-2.5">
                <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-white border border-[#f0eded] rounded-[14px] overflow-hidden">
              {sortedRanks.map((r, idx) => {
                const xpRequired = r.xp_required ?? 0;
                const isCurrent = r.level === currentLevel;
                const isAchieved = currentLevel > 0 && r.level <= currentLevel;
                const isChoiceRank = r.level === CHOICE_RANK_LEVEL;
                const isTrackSpecific = r.track_id != null;

                // Bloqueado se específico de trilha e o usuário não tem trilha
                // ou é de uma trilha diferente da sua
                const isLocked = isTrackSpecific && (!userTrack || r.track_id !== userTrack.id);

                // Os 2 últimos ranks (top 3 por level) têm XP oculto
                const isTopSecret = idx >= sortedRanks.length - 3;

                return (
                  <View
                    key={r.id}
                    onLayout={isCurrent ? (e) => { currentRankY.current = e.nativeEvent.layout.y; } : undefined}
                    className={`px-4 py-3 ${idx > 0 ? 'border-t border-[#f4f1f1]' : ''} ${
                      isChoiceRank ? 'bg-accent-500/10' : isCurrent ? 'bg-[#f4eaea]' : isLocked ? 'bg-[#f8f8f8]' : ''
                    }`}>
                    <View className="flex-row items-center">
                      {/* Imagem da patente */}
                      <View className="w-11 h-11 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden">
                        {r.image_url ? (
                          <Image
                            source={{ uri: r.image_url }}
                            style={{ width: 36, height: 36, opacity: isLocked ? 0.2 : isAchieved ? 1 : 0.35 }}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text className="text-[12px] text-[#bbb] font-bold">{r.level}</Text>
                        )}
                      </View>

                      <View className="flex-1 ml-3">
                        <Text
                          className={`text-[14px] font-semibold ${
                            isLocked ? 'text-[#ccc]' : isCurrent ? 'text-primary-500' : isAchieved ? 'text-[#222]' : 'text-[#999]'
                          }`}>
                          {r.name}
                          {isCurrent ? t('ranks.currentSuffix') : ''}
                        </Text>
                        <Text className={`text-[11px] ${isLocked ? 'text-[#ddd]' : 'text-[#aaa]'}`}>
                          {t('ranks.level', { level: r.level })}
                          {isLocked && !userTrack ? t('ranks.chooseTrackSuffix') : ''}
                        </Text>
                      </View>

                      <View className="items-end">
                        {isLocked ? (
                          <LockIcon size={16} color="#ccc" strokeWidth={2} />
                        ) : isTopSecret ? (
                          <View className="items-end">
                            <Text className="text-[15px] font-bold text-[#ccc]">{t('ranks.secretXp')}</Text>
                            <Text className="text-[9px] text-[#ccc]">{t('ranks.secretXpHint')}</Text>
                          </View>
                        ) : (
                          <>
                            <Text
                              className={`text-[13px] font-bold ${isAchieved ? 'text-[#333]' : 'text-[#bbb]'}`}>
                              {xpRequired.toLocaleString()} {t('common.xp')}
                            </Text>
                            {isAchieved && !isCurrent && (
                              <Text className="text-[10px] text-primary-500 font-semibold">{t('ranks.conquered')}</Text>
                            )}
                          </>
                        )}
                      </View>
                    </View>

                    {/* Banner de escolha de trilha — só aparece se o usuário ainda não tem trilha */}
                    {isChoiceRank && !userTrack && (
                      <View className="flex-row items-center mt-2.5 bg-accent-500/20 rounded-[10px] px-3 py-2">
                        <Text className="text-[14px] mr-2">⚔️</Text>
                        <View className="flex-1">
                          <Text className="text-[12px] font-extrabold text-[#7a5b00]">
                            {t('ranks.trackChoiceTitle')}
                          </Text>
                          <Text className="text-[11px] text-[#9a7b1f] leading-[15px]">
                            {t('ranks.trackChoiceDescription')}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
