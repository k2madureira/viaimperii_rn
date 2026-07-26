import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/screenContainer';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar, SearchBar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { DailyMissionsHero } from './components';
import { FeedItem } from '../../api/feed';
import { useLegions } from '../missions/model/queries/useLegions';
import { useDailyBriefing } from '../missions/model/queries/useDailyBriefing';
import { useUserProfile } from './model/queries/useUserProfile';
import { useWallet } from './model/queries/useWallet';
import { useCampaigns } from './model/queries/useCampaigns';
import { useFeed } from './model/queries/useFeed';
import { useFeedEvents } from './model/hooks/useFeedEvents';
import { useNotificationEvents } from './model/hooks/useNotificationEvents';
import { usePersistedFlag } from '../../hooks/usePersistedFlag';
import {
  CurrentCampaign,
  DashboardHeader,
  DashboardModals,
  HomeFeed,
  HomeNavActions,
} from './components/sections';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t } = useTranslation();

  const isTemporary = user?.is_temporary_password === true;

  const profileQuery = useUserProfile(user?.user_id);
  const walletQuery = useWallet(!!user);
  // Meta diária do hero (só o progresso). Reusa o briefing (traz `goal`); como o
  // hero não lista mais missões, pedimos o mínimo de sugestões.
  const briefingQuery = useDailyBriefing(1, !!user);
  const campaignsQuery = useCampaigns();
  const legionsQuery = useLegions();

  // Feed social (timeline da home) + tempo real via SSE.
  const feedQuery = useFeed('home', !!user);
  useFeedEvents(!!user);
  useNotificationEvents(!!user);

  const data = profileQuery.data;
  const profile = data?.user;
  const legion = data?.legion ?? null;

  const refreshing =
    profileQuery.isRefetching || briefingQuery.isRefetching || feedQuery.isRefetching;

  const onRefresh = () => {
    profileQuery.refetch();
    walletQuery.refetch();
    briefingQuery.refetch();
    campaignsQuery.refetch();
    feedQuery.refetch();
  };

  // ── Modais automáticos (senha → província → trilha → legião) ──────────────
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [provinceDismissed, markProvinceDismissed] = usePersistedFlag('modal_dismissed_province');
  const [trackModalVisible, setTrackModalVisible] = useState(false);
  const [trackDismissed, markTrackDismissed] = usePersistedFlag('modal_dismissed_track');
  const [legionModalVisible, setLegionModalVisible] = useState(false);
  const [legionDismissed, markLegionDismissed] = usePersistedFlag('modal_dismissed_legion');
  const [recommendedIds] = useState<number[]>([]);
  // Modal de comentários do feed.
  const [commentsItem, setCommentsItem] = useState<FeedItem | null>(null);
  // Modal de busca global.
  const [searchVisible, setSearchVisible] = useState(false);

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
  const displayName = user?.name ?? t('dashboard.defaultName');
  const rankName = profile?.rank ?? user?.rank ?? '—';
  const avatarUrl = data?.active_avatar?.thumb_url ?? data?.active_avatar?.url ?? null;

  const completedIds = new Set(profile?.completed_missions?.map((c) => c.mission_id) ?? []);
  const completedCampaigns = new Set(profile?.completed_campaigns ?? []);

  const feedItems = (feedQuery.data?.pages ?? []).flatMap((p) => p.items);

  const ListHeader = (
    <View style={{ gap: 18 }}>
      <DashboardHeader
        name={displayName}
        rankName={rankName}
        avatarUrl={avatarUrl}
        onOpenProfile={() => navigation.navigate('Profile')}
        onOpenChat={() => navigation.navigate('Friends')}
      />

      {/* 2 — HERO: MISSÕES DO DIA (progresso da meta, acima do feed) */}
      <DailyMissionsHero
        allowance={briefingQuery.data?.goal}
        onSeeAll={() => navigation.navigate('Missions')}
      />

      <CurrentCampaign
        campaigns={campaignsQuery.data ?? []}
        completedMissionIds={completedIds}
        completedCampaignIds={completedCampaigns}
        onContinue={() => navigation.navigate('Missions')}
      />

      {/* 5 — BARRA DE BUSCA GLOBAL */}
      <View style={{ paddingTop: 6, paddingBottom: 6 }}>
        <SearchBar onPress={() => setSearchVisible(true)} />
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <Navbar
        menuVariant="gear"
        rightExtra={
          <HomeNavActions
            streak={user?.streak ?? null}
            walletBalance={walletQuery.data?.balance ?? null}
          />
        }
      />

      <HomeFeed
        items={feedItems}
        currentUserId={user?.user_id}
        legions={legionsQuery.data}
        header={ListHeader}
        isLoading={feedQuery.isLoading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        hasNextPage={!!feedQuery.hasNextPage}
        isFetchingNextPage={feedQuery.isFetchingNextPage}
        onEndReached={() => feedQuery.fetchNextPage()}
        bottomInset={insets.bottom}
        onOpenComments={setCommentsItem}
      />

      <DashboardModals
        userId={user?.user_id}
        isTemporary={isTemporary}
        legions={legionsQuery.data ?? []}
        province={{
          visible: provinceModalVisible,
          onDismiss: () => {
            setProvinceModalVisible(false);
            markProvinceDismissed();
          },
          onSuccess: () => setProvinceModalVisible(false),
        }}
        track={{
          visible: trackModalVisible,
          currentTrackSlug: data?.track?.slug ?? null,
          onDismiss: () => {
            setTrackModalVisible(false);
            markTrackDismissed();
          },
          onSuccess: () => setTrackModalVisible(false),
        }}
        legion={{
          visible: legionModalVisible,
          recommendedIds,
          onDismiss: () => {
            setLegionModalVisible(false);
            markLegionDismissed();
          },
          onSuccess: () => setLegionModalVisible(false),
        }}
        comments={{ item: commentsItem, onClose: () => setCommentsItem(null) }}
        search={{ visible: searchVisible, onClose: () => setSearchVisible(false) }}
      />
    </ScreenContainer>
  );
}
