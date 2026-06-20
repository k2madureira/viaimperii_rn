import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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
import { LegionSelectModal, ProvinceSetupModal, UserMenu } from '../../components';
import { MASTERY_ICONS } from '../../components/masteryIcons';
import { useAuth } from '../../contexts/AuthContext';
import { XP_PER_RANK } from '../../constants/game';
import { legionColorById } from '../../utils/legionColors';
import { ChangePasswordModal } from './components';
import { useLegions } from '../missions/model/queries/useLegions';
import { useAvailableMissions } from '../missions/model/queries/useAvailableMissions';
import { useJoinLegion } from '../missions/model/mutations/useJoinLegion';
import { useUserProfile } from './model/queries/useUserProfile';
import { useCampaigns } from './model/queries/useCampaigns';
import { useLegionDetail } from './model/queries/useLegionDetail';
import { useUpdateProvince } from './model/mutations/useUpdateProvince';

const MASTERIES = [
  { key: 'Engineering', latin: 'Fabrorum', pt: 'Engenharia' },
  { key: 'Strategy', latin: 'Strategica', pt: 'Estratégia' },
  { key: 'Commerce', latin: 'Mercatorum', pt: 'Comércio' },
  { key: 'Diplomacy', latin: 'Diplomatica', pt: 'Diplomacia' },
  { key: 'Exploration', latin: 'Exploratorum', pt: 'Exploração' },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const isTemporary = user?.is_temporary_password === true;

  const profileQuery = useUserProfile(user?.user_id);
  const availableQuery = useAvailableMissions(null, null);
  const campaignsQuery = useCampaigns();
  const legionsQuery = useLegions();

  const data = profileQuery.data;
  const profile = data?.user;
  const currentRank = data?.current_rank ?? null;
  const xpToNextRank = data?.xp_to_next_rank ?? 0;
  const legion = data?.legion ?? null;
  const legionDetailQuery = useLegionDetail(legion?.id);

  const refreshing =
    profileQuery.isRefetching || availableQuery.isRefetching || campaignsQuery.isRefetching;

  const onRefresh = () => {
    profileQuery.refetch();
    availableQuery.refetch();
    campaignsQuery.refetch();
  };

  // ── Província / Legião (modais automáticos) ────────────────────────────────
  const updateProvinceM = useUpdateProvince(user?.user_id);
  const joinLegionM = useJoinLegion(user?.user_id);
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [provinceDismissed, setProvinceDismissed] = useState(false);
  const [legionModalVisible, setLegionModalVisible] = useState(false);
  const [legionDismissed, setLegionDismissed] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const needsProvince = profileQuery.isSuccess && data?.province == null;
  const hasLegion = legion != null;
  const completedCount = profile?.completed_missions?.length ?? 0;

  useEffect(() => {
    if (isTemporary || provinceDismissed) return;
    if (needsProvince) setProvinceModalVisible(true);
  }, [isTemporary, provinceDismissed, needsProvince]);

  useEffect(() => {
    if (isTemporary || legionDismissed || needsProvince) return;
    if (!hasLegion && completedCount > 0) setLegionModalVisible(true);
  }, [isTemporary, legionDismissed, needsProvince, hasLegion, completedCount]);

  // ── Dados derivados ────────────────────────────────────────────────────────
  const firstName = user?.name?.split(' ')[0] ?? 'Legionário';
  const rankName = profile?.rank ?? user?.rank ?? '—';
  const totalXp = profile?.total_xp ?? user?.total_xp ?? 0;
  const currentLevel = currentRank?.level ?? 1;
  const isMaxRank = xpToNextRank <= 0;
  const xpInRank = isMaxRank ? XP_PER_RANK : Math.max(0, XP_PER_RANK - xpToNextRank);
  const rankProgress = Math.min(1, xpInRank / XP_PER_RANK);
  const ranks = data?.ranks ?? [];
  const nextRankName = ranks.find((r) => r.level === currentLevel + 1)?.name ?? null;

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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 18 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9E1B32" />
        }>
        {/* 1 — HEADER */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text
              className="text-[26px] font-extrabold text-charcoal"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              Ave, {firstName}
            </Text>
            <Text className="text-[13px] text-[#777] mt-0.5" numberOfLines={1}>
              {rankName}
              {legion ? ` • ${legion.name}` : ''}
            </Text>
          </View>
          <UserMenu
            onEdit={() => navigation.navigate('Profile')}
            onChangePassword={() => setShowPassword(true)}
          />
        </View>

        {/* 2 — RANK PROGRESSION */}
        <View className="bg-primary rounded-[20px] p-5">
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="text-[11px] font-bold text-white/70 tracking-[3px] uppercase">
                Sua patente
              </Text>
              <Text
                className="text-[28px] font-extrabold text-white mt-1"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {rankName}
              </Text>
              <Text className="text-[13px] text-white/80 mt-1">
                {xpInRank} / {XP_PER_RANK} XP
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
            {isMaxRank
              ? 'Patente máxima alcançada'
              : `Faltam ${xpToNextRank} XP para ${nextRankName ?? 'a próxima patente'}`}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Ranks')}
            activeOpacity={0.9}
            className="bg-white/15 rounded-[12px] py-2.5 items-center mt-4">
            <Text className="text-[13px] font-bold text-white">Ver Requisitos</Text>
          </TouchableOpacity>
        </View>

        {/* 3 — MISSÃO DO DIA */}
        <View className="bg-white border border-[#f0eded] rounded-[18px] p-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[15px] font-extrabold text-charcoal">⚔️ Missão do Dia</Text>
            {dailyReward > 0 && (
              <View className="bg-gold/20 rounded-full px-2.5 py-1">
                <Text className="text-[12px] font-bold text-[#9a7b1f]">+{dailyReward} XP</Text>
              </View>
            )}
          </View>

          {dailyMissions.length === 0 ? (
            <Text className="text-[13px] text-[#999]">
              Nenhuma missão diária disponível agora.
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
            <Text className="text-[14px] font-bold text-white">Ver todas as missões</Text>
          </TouchableOpacity>
        </View>

        {/* 4 — CAMPANHA ATUAL */}
        {activeCampaign && (
          <View className="bg-white border border-[#f0eded] rounded-[18px] p-5">
            <Text className="text-[15px] font-extrabold text-charcoal mb-1">📖 Campanha Atual</Text>
            <Text className="text-[14px] font-bold text-primary">
              {formatCampaignName(activeCampaign.campaign.name)}
            </Text>
            <Text className="text-[12px] text-[#888] mt-1">
              {activeCampaign.done} de {activeCampaign.total} missões
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
              <Text className="text-[13px] font-bold text-primary">Continuar Campanha</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5 — MAESTRIAS (horizontal) */}
        <View>
          <Text className="text-[15px] font-extrabold text-charcoal mb-3">Maestrias</Text>
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
                  <Text className="text-[11px] text-[#888]">{spec.pt}</Text>
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
              <Text className="text-[15px] font-extrabold text-charcoal">🏅 Últimas Conquistas</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Achievements')} activeOpacity={0.7}>
                <Text className="text-[12px] font-bold text-primary">Ver Todas</Text>
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
                  <Text className="text-[12px] font-bold text-gold">+{a.xp_reward} XP</Text>
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
                {legionMembers != null ? `${legionMembers} membros ativos` : 'Sua legião'}
              </Text>
            </View>
            <Text className="text-[#bbb] text-[20px]">›</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modais automáticos */}
      <ChangePasswordModal visible={isTemporary} isTemporary={isTemporary} onClose={() => {}} />

      {/* Troca de senha manual (via dropdown do usuário) */}
      <ChangePasswordModal
        visible={showPassword && !isTemporary}
        isTemporary={false}
        onClose={() => setShowPassword(false)}
      />

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
