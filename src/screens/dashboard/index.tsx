import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
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
import { ChangePasswordModal, StreakButton, WalletButton } from './components';
import { CommentsModal, FeedCard, FeedComposer } from './components/feed';
import { FeedItem } from '../../api/feed/feedApi';
import { useLegions } from '../missions/model/queries/useLegions';
import { useAvailableMissions } from '../missions/model/queries/useAvailableMissions';
import { useJoinLegion } from '../missions/model/mutations/useJoinLegion';
import { useUserProfile } from './model/queries/useUserProfile';
import { useWallet } from './model/queries/useWallet';
import { useCampaigns } from './model/queries/useCampaigns';
import { useUpdateProvince } from './model/mutations/useUpdateProvince';
import { useChooseTrack } from './model/mutations/useChooseTrack';
import { useTracks } from '../ranks/model/queries/useTracks';
import { useFeed } from './model/queries/useFeed';
import { useReactFeed } from './model/mutations/useReactFeed';
import { useFeedEvents } from './model/hooks/useFeedEvents';
import { usePersistedFlag } from '../../hooks/usePersistedFlag';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t } = useTranslation();

  const isTemporary = user?.is_temporary_password === true;

  const profileQuery = useUserProfile(user?.user_id);
  const walletQuery = useWallet(!!user);
  const availableQuery = useAvailableMissions(null, null);
  const campaignsQuery = useCampaigns();
  const legionsQuery = useLegions();

  // Feed social (timeline da home) + tempo real via SSE.
  const feedQuery = useFeed('home', !!user);
  const reactM = useReactFeed();
  useFeedEvents(!!user);

  const data = profileQuery.data;
  const profile = data?.user;
  const legion = data?.legion ?? null;

  const refreshing =
    profileQuery.isRefetching || availableQuery.isRefetching || feedQuery.isRefetching;

  const onRefresh = () => {
    profileQuery.refetch();
    walletQuery.refetch();
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
  const [provinceDismissed, markProvinceDismissed] = usePersistedFlag('modal_dismissed_province');
  const [trackModalVisible, setTrackModalVisible] = useState(false);
  const [trackDismissed, markTrackDismissed] = usePersistedFlag('modal_dismissed_track');
  const [legionModalVisible, setLegionModalVisible] = useState(false);
  const [legionDismissed, markLegionDismissed] = usePersistedFlag('modal_dismissed_legion');
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
  const streak = user?.streak ?? null;
  const firstName = user?.name?.split(' ')[0] ?? t('dashboard.defaultName');
  const rankName = profile?.rank ?? user?.rank ?? '—';

  const completedIds = new Set(profile?.completed_missions?.map((c) => c.mission_id) ?? []);
  const completedCampaigns = new Set(profile?.completed_campaigns ?? []);
  const activeCampaign = (campaignsQuery.data ?? [])
    .map((c) => {
      const done = c.required_missions.filter((m) => completedIds.has(m)).length;
      return { campaign: c, done, total: c.required_missions.length };
    })
    .find(({ campaign, done, total }) => !completedCampaigns.has(campaign.id) && done < total);

  const feedItems = (feedQuery.data?.pages ?? []).flatMap((p) => p.items);

  const ListHeader = (
    <View style={{ gap: 18 }}>
      {/* 1 — HEADER */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
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
        {streak && streak.current_streak > 0 && <StreakButton streak={streak} />}
      </View>

      {/* 3 — CAMPANHA ATUAL */}
      {activeCampaign && (
        <View className="bg-white border border-[#f0eded] rounded-[18px] p-5">
          <Text className="text-[15px] font-extrabold text-charcoal mb-1">📖 {t('dashboard.currentCampaignTitle')}</Text>
          <Text className="text-[14px] font-bold text-primary-500">
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
            <Text className="text-[13px] font-bold text-primary-500">{t('dashboard.continueCampaign')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 5 — COMPOSER DE POST */}
      <FeedComposer
        avatarUrl={data?.active_avatar?.thumb_url ?? data?.active_avatar?.url ?? null}
        canLegion={legion != null}
        canProvince={data?.province != null}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar
        rightExtra={
          walletQuery.data ? <WalletButton balance={walletQuery.data.balance} /> : null
        }
      />
      <FlatList
        data={feedItems}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={ListHeader}
        ListHeaderComponentStyle={{ marginBottom: 20 }}
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
        contentContainerStyle={{
          paddingHorizontal: 3,
          paddingTop: 20,
          paddingBottom: insets.bottom + 24,
        }}
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
          markProvinceDismissed();
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
          markTrackDismissed();
        }}
      />

      <LegionSelectModal
        visible={legionModalVisible}
        legions={legionsQuery.data ?? []}
        recommendedIds={recommendedIds}
        pending={joinLegionM.isPending}
        onClose={() => {
          setLegionModalVisible(false);
          markLegionDismissed();
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
