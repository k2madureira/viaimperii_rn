import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegionSelectModal, Navbar, ProvinceSetupModal, TrackSelectModal } from '../../components';
import { MASTERY_ICONS } from '../../components/masteryIcons';
import { useAuth } from '../../contexts/AuthContext';
import { legionColorById } from '../../utils/legionColors';
import { ChangePasswordModal } from './components';
import { useLegions } from '../missions/model/queries/useLegions';
import { useAvailableMissions } from '../missions/model/queries/useAvailableMissions';
import { useJoinLegion } from '../missions/model/mutations/useJoinLegion';
import { useUserProfile } from './model/queries/useUserProfile';
import { useCampaigns } from './model/queries/useCampaigns';
import { useLegionDetail } from './model/queries/useLegionDetail';
import { useUpdateProvince } from './model/mutations/useUpdateProvince';
import { useChooseTrack } from './model/mutations/useChooseTrack';
import { useTracks } from '../ranks/model/queries/useTracks';

const MASTERIES = [
  { key: 'Engineering', latin: 'Fabrorum' },
  { key: 'Strategy', latin: 'Strategica' },
  { key: 'Commerce', latin: 'Mercatorum' },
  { key: 'Diplomacy', latin: 'Diplomatica' },
  { key: 'Exploration', latin: 'Exploratorum' },
];

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

  const data = profileQuery.data;
  const profile = data?.user;
  const currentRank = data?.current_rank ?? null;
  const xpToNextRank = currentRank?.xp_to_next_rank ?? data?.xp_to_next_rank ?? 0;
  const legion = data?.legion ?? null;
  const legionDetailQuery = useLegionDetail(legion?.id);

  const refreshing =
    profileQuery.isRefetching || availableQuery.isRefetching || campaignsQuery.isRefetching;

  const onRefresh = () => {
    profileQuery.refetch();
    availableQuery.refetch();
    campaignsQuery.refetch();
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
  const [recommendedIds, setRecommendedIds] = useState<number[]>([]);

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
  const currentLevel = currentRank?.level ?? 1;
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

  const mastery = profile?.mastery ?? {};
  const mainSpecialty = profile?.main_specialty ?? null;

  const dailyMissions = (availableQuery.data?.items ?? [])
    .filter((m) => m.type === 'daily')
    .slice(0, 3);
  const dailyReward = dailyMissions.reduce((sum, m) => sum + (m.xp_reward ?? 0), 0);

  const achievements = (data?.achievements ?? []).filter((a) => a.achieved_at).slice(0, 3);

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

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 18 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9E1B32" />
        }>
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

        {/* 2 — RANK PROGRESSION */}
        <View className="bg-primary rounded-[20px] p-5">
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="text-[11px] font-bold text-white/70 tracking-[3px] uppercase">
                {t('dashboard.yourRank')}
              </Text>
              <Text
                className="text-[28px] font-extrabold text-white mt-1"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {rankName}
              </Text>
              <Text className="text-[13px] text-white/80 mt-1">
                {totalXp.toLocaleString()} {t('common.xp')}
              </Text>
            </View>

            {/* Brasão da patente */}
            {currentRank?.image_url ? (
              <View className="w-20 h-20 rounded-full bg-white/15 items-center justify-center overflow-hidden ml-3">
                <Image
                  source={{ uri: currentRank.image_url }}
                  style={{ width: 64, height: 64 }}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </View>

          <View className="h-[8px] bg-white/25 rounded-full overflow-hidden mt-3">
            <View
              className="h-full rounded-full bg-gold"
              style={{ width: `${rankProgress * 100}%` }}
            />
          </View>

          <Text className="text-[12px] text-white/85 mt-2">
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
            className="bg-white/15 rounded-[12px] py-2.5 items-center mt-4">
            <Text className="text-[13px] font-bold text-white">{t('dashboard.viewRequirements')}</Text>
          </TouchableOpacity>
        </View>

        {/* 3 — MISSÃO DO DIA */}
        <View className="bg-white border border-[#f0eded] rounded-[18px] p-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[15px] font-extrabold text-charcoal">⚔️ {t('dashboard.dailyMissionTitle')}</Text>
            {dailyReward > 0 && (
              <View className="bg-gold/20 rounded-full px-2.5 py-1">
                <Text className="text-[12px] font-bold text-[#9a7b1f]">+{dailyReward} XP</Text>
              </View>
            )}
          </View>

          {dailyMissions.length === 0 ? (
            <Text className="text-[13px] text-[#999]">
              {t('dashboard.noDailyMissions')}
            </Text>
          ) : (
            <View className="gap-2.5">
              {dailyMissions.map((m) => (
                <View key={m.id} className="flex-row items-center">
                  <Text className="text-[16px] text-[#bbb] mr-2.5">□</Text>
                  <Text className="flex-1 text-[14px] text-[#333]" numberOfLines={1}>
                    {m.name}
                  </Text>
                  <Text className="text-[12px] font-bold text-gold">+{m.xp_reward}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('Missions')}
            activeOpacity={0.9}
            className="bg-primary rounded-[12px] py-3 items-center mt-4">
            <Text className="text-[14px] font-bold text-white">{t('dashboard.viewAllMissions')}</Text>
          </TouchableOpacity>
        </View>

        {/* 4 — CAMPANHA ATUAL */}
        {activeCampaign && (
          <View className="bg-white border border-[#f0eded] rounded-[18px] p-5">
            <Text className="text-[15px] font-extrabold text-charcoal mb-1">📖 {t('dashboard.currentCampaignTitle')}</Text>
            <Text className="text-[14px] font-bold text-primary">
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
              <Text className="text-[13px] font-bold text-primary">{t('dashboard.continueCampaign')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5 — MAESTRIAS (horizontal) */}
        <View>
          <Text className="text-[15px] font-extrabold text-charcoal mb-3">{t('dashboard.masteries')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
            {MASTERIES.map((spec) => {
              const points = mastery[spec.key] ?? 0;
              const ceiling = points + currentLevel * 10;
              const progress = ceiling > 0 ? Math.min(1, points / ceiling) : 0;
              const isMain = spec.key === mainSpecialty;
              const Icon = MASTERY_ICONS[spec.key];
              return (
                <View
                  key={spec.key}
                  className="w-[130px] bg-white border border-[#f0eded] rounded-[16px] p-3.5">
                  {Icon ? <Icon size={24} color={isMain ? '#9E1B32' : '#121212'} /> : null}
                  <Text className="text-[13px] font-extrabold text-charcoal mt-2">{spec.latin}</Text>
                  <Text className="text-[11px] text-[#888]">{t(`masteries.${spec.key}`)}</Text>
                  <View className="h-[5px] bg-[#f0eded] rounded-full overflow-hidden mt-2.5">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${progress * 100}%`, backgroundColor: isMain ? '#9E1B32' : '#D4AF37' }}
                    />
                  </View>
                  <Text className="text-[11px] text-[#999] mt-1.5">
                    {points}/{ceiling}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 6 — ÚLTIMAS CONQUISTAS */}
        {achievements.length > 0 && (
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[15px] font-extrabold text-charcoal">🏅 {t('dashboard.latestAchievementsTitle')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Achievements')} activeOpacity={0.7}>
                <Text className="text-[12px] font-bold text-primary">{t('dashboard.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-2.5">
              {achievements.map((a) => (
                <View
                  key={a.id}
                  className="flex-row items-center bg-white border border-[#f0eded] rounded-[14px] p-3.5">
                  <Text className="text-[20px] mr-3">🏅</Text>
                  <Text className="flex-1 text-[14px] font-bold text-charcoal" numberOfLines={1}>
                    {a.name}
                  </Text>
                  <Text className="text-[12px] font-bold text-gold">+{a.xp_reward} {t('common.xp')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 7 — POSIÇÃO NA LEGIÃO */}
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
      </ScrollView>

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
    </View>
  );
}

function formatCampaignName(name: string) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
