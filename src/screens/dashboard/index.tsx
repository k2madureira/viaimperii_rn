import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegionSelectModal, Navbar, ProvinceSetupModal, TrackSelectModal } from '../../components';
import { PrimusPilusEmblem } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';
import { legionColorById } from '../../utils/legionColors';
import { ChangePasswordModal } from './components';
import {
  CommentsModal,
  FeedCard,
  FeedComposer,
  MissionsSummaryCard,
} from './components/feed';
import { FeedItem } from '../../api/feed/feedApi';
import { useLegions } from '../missions/model/queries/useLegions';
import { useAvailableMissions } from '../missions/model/queries/useAvailableMissions';
import { useJoinLegion } from '../missions/model/mutations/useJoinLegion';
import { useUserProfile } from './model/queries/useUserProfile';
import { useCampaigns } from './model/queries/useCampaigns';
import { useLegionDetail } from './model/queries/useLegionDetail';
import { useUpdateProvince } from './model/mutations/useUpdateProvince';
import { useChooseTrack } from './model/mutations/useChooseTrack';
import { useTracks } from '../ranks/model/queries/useTracks';
import { useFeed } from './model/queries/useFeed';
import { useReactFeed } from './model/mutations/useReactFeed';
import { useFeedEvents } from './model/hooks/useFeedEvents';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t } = useTranslation();

  const isTemporary = user?.is_temporary_password === true;

  const profileQuery = useUserProfile(user?.user_id);
  const availableQuery = useAvailableMissions(null, null);
  const campaignsQuery = useCampaigns();
  const legionsQuery = useLegions();

  // Feed social (timeline da home) + tempo real via SSE.
  const feedQuery = useFeed('home', !!user);
  const reactM = useReactFeed();
  useFeedEvents(!!user);

  const data = profileQuery.data;
  const profile = data?.user;
  const currentRank = data?.current_rank ?? null;
  const xpToNextRank = currentRank?.xp_to_next_rank ?? data?.xp_to_next_rank ?? 0;
  const legion = data?.legion ?? null;
  const legionDetailQuery = useLegionDetail(legion?.id);

  const refreshing =
    profileQuery.isRefetching || availableQuery.isRefetching || feedQuery.isRefetching;

  const onRefresh = () => {
    profileQuery.refetch();
    availableQuery.refetch();
    campaignsQuery.refetch();
    feedQuery.refetch();
  };

  // ── Modais automáticos (senha → província → trilha → legião) ──────────────
  const updateProvinceM = useUpdateProvince(user?.user_id);
  const joinLegionM = useJoinLegion(user?.user_id);
  const chooseTrackM = useChooseTrack(user?.user_id);
  const tracksQuery = useTracks();

  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [provinceDismissed, setProvinceDismissed] = useState(false);
  const [trackModalVisible, setTrackModalVisible] = useState(false);
  const [trackDismissed, setTrackDismissed] = useState(false);
  const [legionModalVisible, setLegionModalVisible] = useState(false);
  const [legionDismissed, setLegionDismissed] = useState(false);
  const [recommendedIds] = useState<number[]>([]);
  // Modal de comentários do feed.
  const [commentsItem, setCommentsItem] = useState<FeedItem | null>(null);

  const needsProvince = profileQuery.isSuccess && data?.province == null;
  const needsTrack = profileQuery.isSuccess && data?.must_choose_track === true;
  const hasLegion = legion != null;
  const completedCount = profile?.completed_missions?.length ?? 0;

  useEffect(() => {
    if (isTemporary || provinceDismissed) return;
    if (needsProvince) setProvinceModalVisible(true);
  }, [isTemporary, provinceDismissed, needsProvince]);

  useEffect(() => {
    if (isTemporary || trackDismissed || needsProvince) return;
    if (needsTrack) setTrackModalVisible(true);
  }, [isTemporary, trackDismissed, needsProvince, needsTrack]);

  useEffect(() => {
    if (isTemporary || legionDismissed || needsProvince || needsTrack) return;
    if (!hasLegion && completedCount > 0) setLegionModalVisible(true);
  }, [isTemporary, legionDismissed, needsProvince, needsTrack, hasLegion, completedCount]);

  // ── Dados derivados ────────────────────────────────────────────────────────
  const firstName = user?.name?.split(' ')[0] ?? t('dashboard.defaultName');
  const rankName = profile?.rank ?? user?.rank ?? '—';
  const totalXp = profile?.total_xp ?? user?.total_xp ?? 0;
  // Bloqueado: tem XP para avançar mas ainda não escolheu trilha (Recruta IV).
  const mustChooseTrack = data?.must_choose_track === true;
  // Patente máxima de verdade (Imperador) — não confundir com o estado bloqueado.
  const isMaxRank = xpToNextRank <= 0 && !mustChooseTrack;
  // Progresso dentro da faixa da patente — calculado no backend (progress_pct, 0..100).
  const rankProgress = mustChooseTrack
    ? 1
    : Math.min(1, (currentRank?.progress_pct ?? 0) / 100);
  // Nome da próxima patente já considerando a trilha do usuário (vem do backend).
  const nextRankName = currentRank?.next_rank_name ?? data?.next_rank_name ?? null;

  // Resumo de missões diárias disponíveis (card compacto ao lado da patente).
  const dailyAvailable = (availableQuery.data?.items ?? []).filter((m) => m.type === 'daily');
  const dailyCount = dailyAvailable.length;
  const dailyXp = dailyAvailable.reduce((sum, m) => sum + (m.xp_reward ?? 0), 0);

  const completedIds = new Set(profile?.completed_missions?.map((c) => c.mission_id) ?? []);
  const completedCampaigns = new Set(profile?.completed_campaigns ?? []);
  const activeCampaign = (campaignsQuery.data ?? [])
    .map((c) => {
      const done = c.required_missions.filter((m) => completedIds.has(m)).length;
      return { campaign: c, done, total: c.required_missions.length };
    })
    .find(({ campaign, done, total }) => !completedCampaigns.has(campaign.id) && done < total);

  const legionColor = legionColorById(legionsQuery.data, legion?.id) ?? '#2F7A52';
  const legionMembers = legionDetailQuery.data?.total_users;

  const feedItems = (feedQuery.data?.pages ?? []).flatMap((p) => p.items);

  const ListHeader = (
    <View style={{ gap: 18 }}>
      {/* 1 — HEADER */}
      <View>
        <Text
          className="text-[26px] font-extrabold text-charcoal"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {t('dashboard.greeting', { name: firstName })}
        </Text>
        <Text className="text-[13px] text-[#777] mt-0.5" numberOfLines={1}>
          {rankName}
          {legion ? ` • ${legion.name}` : ''}
        </Text>
      </View>

      {/* 2 — PATENTE (70%) + MISSÕES (30%) lado a lado */}
      <View className="flex-row" style={{ gap: 12 }}>
        <View className="bg-primary rounded-[20px] p-4 flex-[7]">
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-white/70 tracking-[2px] uppercase">
                {t('dashboard.yourRank')}
              </Text>
              <Text
                className="text-[22px] font-extrabold text-white mt-1"
                numberOfLines={1}
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {rankName}
              </Text>
              <Text className="text-[12px] text-white/80 mt-0.5">
                {totalXp.toLocaleString()} {t('common.xp')}
              </Text>
            </View>

            {currentRank?.image_url ? (
              <View className="w-14 h-14 rounded-full bg-white/15 items-center justify-center overflow-hidden ml-2">
                <Image
                  source={{ uri: currentRank.image_url }}
                  style={{ width: 44, height: 44 }}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </View>

          <View className="h-[7px] bg-white/25 rounded-full overflow-hidden mt-3">
            <View
              className="h-full rounded-full bg-gold"
              style={{ width: `${rankProgress * 100}%` }}
            />
          </View>

          <Text className="text-[11px] text-white/85 mt-2" numberOfLines={2}>
            {mustChooseTrack
              ? t('dashboard.chooseTrackToAdvance')
              : isMaxRank
                ? t('dashboard.maxRankReached')
                : t('dashboard.xpToNextRank', {
                    xp: xpToNextRank,
                    rank: nextRankName ?? t('dashboard.nextRankFallback'),
                  })}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Ranks')}
            activeOpacity={0.9}
            className="bg-white/15 rounded-[12px] py-2.5 items-center mt-3">
            <Text className="text-[12px] font-bold text-white">{t('dashboard.viewRequirements')}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-[3]">
          <MissionsSummaryCard
            count={dailyCount}
            xp={dailyXp}
            onPress={() => navigation.navigate('Missions')}
          />
        </View>
      </View>

      {/* 3 — CAMPANHA ATUAL */}
      {activeCampaign && (
        <View className="bg-white border border-[#f0eded] rounded-[18px] p-5">
          <Text className="text-[15px] font-extrabold text-charcoal mb-1">📖 {t('dashboard.currentCampaignTitle')}</Text>
          <Text className="text-[14px] font-bold text-bg-primary-500">
            {formatCampaignName(activeCampaign.campaign.name)}
          </Text>
          <Text className="text-[12px] text-[#888] mt-1">
            {t('dashboard.missionsProgress', {
              done: activeCampaign.done,
              total: activeCampaign.total,
            })}
          </Text>
          <View className="h-[6px] bg-[#f0eded] rounded-full overflow-hidden mt-2">
            <View
              className="h-full bg-laurel rounded-full"
              style={{
                width: `${activeCampaign.total > 0 ? (activeCampaign.done / activeCampaign.total) * 100 : 0}%`,
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Missions')}
            activeOpacity={0.9}
            className="border border-[#e6dada] rounded-[12px] py-2.5 items-center mt-4">
            <Text className="text-[13px] font-bold text-bg-primary-500">{t('dashboard.continueCampaign')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4 — POSIÇÃO NA LEGIÃO */}
      {legion && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Legion')}
          activeOpacity={0.85}
          className="flex-row items-center bg-white border border-[#f0eded] rounded-[16px] p-4">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3 overflow-hidden"
            style={{ backgroundColor: legion.image_url ? '#faf7f7' : legionColor }}>
            {legion.image_url ? (
              <Image
                source={{ uri: legion.image_url }}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            ) : (
              <Text className="text-[18px]">🦅</Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-extrabold text-charcoal">{legion.name}</Text>
            <Text className="text-[12px] text-[#888]">
              {legionMembers != null
                ? t('dashboard.activeMembers', { count: legionMembers })
                : t('dashboard.yourLegionFallback')}
            </Text>
          </View>
          <Text className="text-[#bbb] text-[20px]">›</Text>
        </TouchableOpacity>
      )}

      {/* 5 — COMPOSER DE POST */}
      <FeedComposer
        avatarUrl={data?.active_avatar?.url ?? null}
        canLegion={legion != null}
        canProvince={data?.province != null}
      />

      {/* 6 — TÍTULO DO MURAL */}
      <View className="flex-row items-center gap-2 mt-1">
        <PrimusPilusEmblem size={26} />
        <Text
          className="text-[18px] font-extrabold text-charcoal"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {t('feed.title')}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar />
      <FlatList
        data={feedItems}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            currentUserId={user?.user_id}
            legions={legionsQuery.data}
            onReact={(eventId, type, currentMine) =>
              reactM.mutate({ eventId, type, currentMine })
            }
            onOpenComments={setCommentsItem}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9E1B32" />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
            feedQuery.fetchNextPage();
          }
        }}
        ListEmptyComponent={
          feedQuery.isLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator color="#8B1A2B" />
            </View>
          ) : (
            <View className="bg-white border border-[#f0eded] rounded-[18px] py-10 items-center px-6 mt-2">
              <PrimusPilusEmblem size={56} />
              <Text className="text-[14px] font-bold text-charcoal mt-3 text-center">
                {t('feed.emptyTitle')}
              </Text>
              <Text className="text-[12px] text-[#999] mt-1 text-center">
                {t('feed.emptyBody')}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          feedQuery.isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#8B1A2B" size="small" />
            </View>
          ) : null
        }
      />

      {/* Modal automático para senha temporária */}
      <ChangePasswordModal visible={isTemporary} isTemporary={isTemporary} onClose={() => {}} />

      <ProvinceSetupModal
        visible={provinceModalVisible}
        pending={updateProvinceM.isPending}
        onClose={() => {
          setProvinceModalVisible(false);
          setProvinceDismissed(true);
        }}
        onConfirm={(provinceId) =>
          updateProvinceM.mutate(provinceId, {
            onSuccess: () => setProvinceModalVisible(false),
          })
        }
      />

      <TrackSelectModal
        visible={trackModalVisible}
        tracks={tracksQuery.data ?? []}
        currentTrackSlug={data?.track?.slug ?? null}
        isLoading={chooseTrackM.isPending}
        onChoose={(slug) =>
          chooseTrackM.mutate(slug, {
            onSuccess: () => {
              setTrackModalVisible(false);
            },
          })
        }
        onClose={() => {
          setTrackModalVisible(false);
          setTrackDismissed(true);
        }}
      />

      <LegionSelectModal
        visible={legionModalVisible}
        legions={legionsQuery.data ?? []}
        recommendedIds={recommendedIds}
        pending={joinLegionM.isPending}
        onClose={() => {
          setLegionModalVisible(false);
          setLegionDismissed(true);
        }}
        onConfirm={(legionId) =>
          joinLegionM.mutate(legionId, {
            onSuccess: () => setLegionModalVisible(false),
          })
        }
      />

      <CommentsModal item={commentsItem} onClose={() => setCommentsItem(null)} />
    </View>
  );
}

function formatCampaignName(name: string) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
