import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRewardedVideo } from './model/mutations/useRewardedVideo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegionSelectModal, Navbar } from '../../components';
import { Mission } from '../../api/missions/missionsApi';
import { StatsPeriod } from '../../api/users/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { XP_PER_RANK } from '../../constants/game';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';

// Ordenação por dificuldade: fácil → médio → difícil (nulos por último).
const DIFFICULTY_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
const sortByDifficulty = (list: Mission[]) =>
  [...list].sort(
    (a, b) =>
      (DIFFICULTY_ORDER[a.difficulty ?? ''] ?? 99) - (DIFFICULTY_ORDER[b.difficulty ?? ''] ?? 99),
  );
import {
  LoadMoreButton,
  MissionItem,
  MissionsTab,
  MissionsTabs,
  PeriodStats,
  SpecialtyFilter,
  StatsFilter,
} from './components';

const PAGE_SIZE = 5;
import { useCompleteMission, useStartMission } from './model/mutations/useMissionMutations';
import { useJoinLegion } from './model/mutations/useJoinLegion';
import { useAvailableMissions } from './model/queries/useAvailableMissions';
import { useLegions } from './model/queries/useLegions';
import { useMissions } from './model/queries/useMissions';
import { useSpecialties } from './model/queries/useSpecialties';
import { useUserStats } from './model/queries/useUserStats';

const FIRST_TRACK_RANK: Record<string, string> = {
  legionarios: 'Legionary I',
  patricios: 'Discipulus I',
};

export default function MissionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const profileQuery = useUserProfile(user?.user_id);
  const userTrack = profileQuery.data?.track ?? null;

  const [period, setPeriod] = useState<StatsPeriod>('monthly');
  const [tab, setTab] = useState<MissionsTab>('available');
  const [missionType, setMissionType] = useState<'daily' | 'monthly'>('daily');
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const isHistory = tab === 'history';
  const isInProgress = tab === 'inprogress';

  // Abaixo de Recruta IV (nível 4 → 1500 XP), só missões de nível fácil.
  const isBelowRecruitIV = (user?.total_xp ?? 0) < XP_PER_RANK * 3;
  const forcedDifficulty = isBelowRecruitIV ? 'easy' : null;
  const unlockRankName = userTrack ? (FIRST_TRACK_RANK[userTrack.slug] ?? 'Legionary I / Discipulus I') : 'Legionary I / Discipulus I';

  // Reinicia a paginação ao trocar de aba, tipo ou especialidade.
  useEffect(() => setVisible(PAGE_SIZE), [tab, missionType, specialtyId]);

  const statsQuery = useUserStats(user?.user_id, period);
  const specialtiesQuery = useSpecialties();
  const availableQuery = useAvailableMissions(specialtyId, forcedDifficulty, !isHistory);
  // Catálogo completo (já filtrado por trilha no backend) — usado para derivar
  // quais especialidades pertencem à trilha do usuário, sem o efeito da cota diária.
  const catalogQuery = useMissions(undefined, true);
  // Histórico = em andamento + concluídas, filtrados pelo backend (status=...).
  const inProgressQuery = useMissions('in_progress', isInProgress);
  const completedQuery = useMissions('completed', isHistory);

  const startM = useStartMission();
  const completeM = useCompleteMission();
  const joinLegionM = useJoinLegion(user?.user_id);
  const legionsQuery = useLegions();
  const { adState, watchAd } = useRewardedVideo();

  // Modal de escolha de legião (abre após a 1ª missão concluída sem legião).
  const [legionModalVisible, setLegionModalVisible] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<number[]>([]);

  const handleComplete = (slug: string) => {
    completeM.mutate(slug, {
      onSuccess: (result) => {
        if (result.requires_legion_selection) {
          setRecommendedIds((result.recommended_legions ?? []).map((l) => l.id));
          setLegionModalVisible(true);
        }
      },
    });
  };

  const pendingSlug = startM.isPending
    ? startM.variables
    : completeM.isPending
      ? completeM.variables
      : null;

  const allAvailable = availableQuery.data?.items ?? [];
  const availableMissions = sortByDifficulty(allAvailable.filter((m) => m.type === missionType));

  // Especialidades da trilha do usuário (derivadas do catálogo completo, não da
  // lista capada pela cota). Sem trilha definida → mostra todas.
  const trackSpecialtyIds = new Set(
    (catalogQuery.data ?? []).map((m) => m.specialty_id).filter((id): id is number => id != null),
  );
  const filteredSpecialties = (specialtiesQuery.data ?? []).filter(
    (s) => !userTrack || trackSpecialtyIds.has(s.id),
  );
  const allowance = availableQuery.data?.availableMissions;
  const activeAllowanceCount = missionType === 'daily' ? (allowance?.daily ?? null) : (allowance?.weekly ?? null);
  const activeResetAt = missionType === 'daily' ? allowance?.daily_reset_at : allowance?.weekly_reset_at;
  const historyMissions = sortByDifficulty([
    ...(inProgressQuery.data ?? []),
    ...(completedQuery.data ?? []),
  ]);

  const inProgressMissions = sortByDifficulty(inProgressQuery.data ?? []);
  const inProgressLoading = inProgressQuery.isLoading;
  const inProgressError = inProgressQuery.isError;

  const historyLoading =  completedQuery.isLoading;
  const historyError =  completedQuery.isError;

  let refreshing = statsQuery.isRefetching;

  if(isHistory) {
    refreshing = completedQuery.isRefetching;
  } else if(isInProgress){
    refreshing = inProgressQuery.isRefetching;
  } else if (!isHistory && !isInProgress) {
    refreshing = availableQuery.isRefetching
  }

  const onRefresh = () => {
    statsQuery.refetch();
    if (isHistory) {
      inProgressQuery.refetch();
      completedQuery.refetch();
    } else {
      availableQuery.refetch();
    }
  };

  const renderItem = (m: Mission) => (
    <MissionItem
      key={m.id}
      mission={m}
      onStart={(slug) => startM.mutate(slug)}
      onComplete={handleComplete}
      pending={pendingSlug === m.slug}
    />
  );

  // Mostra `visible` missões + botão "Buscar mais" enquanto houver restantes.
  const renderList = (list: Mission[]) => {
    const remaining = list.length - visible;
    return (
      <View className="gap-3">
        {list.slice(0, visible).map(renderItem)}
        {remaining > 0 && (
          <LoadMoreButton
            remaining={remaining}
            onPress={() => setVisible((v) => v + PAGE_SIZE)}
          />
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B1A2B" />
        }>
        {/* Filtro de período + estatísticas */}
        <StatsFilter value={period} onChange={setPeriod} />
        <PeriodStats stats={statsQuery.data} isLoading={statsQuery.isLoading} />

        {/* ── Seletor de tipo: Diárias | Semanais ────────────────────────── */}
        <View className="bg-[#6B1221] rounded-[16px] p-4 gap-3">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-white/40 tracking-[2px] uppercase">
                Tipo de missão
              </Text>
              <Text
                className="text-[18px] font-extrabold text-white mt-0.5"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {missionType === 'daily' ? 'Missões Diárias' : 'Missões Semanais'}
              </Text>
            </View>
            {allowance && activeAllowanceCount != null && (
              <View className={`px-3 py-1.5 rounded-full ${
                activeAllowanceCount === 0 ? 'bg-white/10' : missionType === 'daily' ? 'bg-gold' : 'bg-laurel'
              }`}>
                <Text className={`text-[11px] font-bold ${activeAllowanceCount === 0 ? 'text-white/40' : 'text-white'}`}>
                  {activeAllowanceCount === 0
                    ? 'Esgotado'
                    : `${activeAllowanceCount} restante${activeAllowanceCount !== 1 ? 's' : ''}`}
                </Text>
              </View>
            )}
          </View>

          {/* Abas de tipo */}
          <View className="flex-row bg-white/10 rounded-[10px] p-1">
            <TypeTab
              label="Diárias"
              active={missionType === 'daily'}
              activeColor="#D4AF37"
              count={allowance?.daily}
              onPress={() => setMissionType('daily')}
            />
            {!isBelowRecruitIV && (
              <TypeTab
                label="Semanais"
                active={missionType === 'monthly'}
                activeColor="#2F7A52"
                count={allowance?.weekly}
                onPress={() => setMissionType('monthly')}
              />
            )}
          </View>

          {/* Reset timer + botão de vídeo quando cota esgotada */}
          {allowance && activeAllowanceCount === 0 && activeResetAt && (
            <AllowanceBar
              remaining={0}
              max={missionType === 'daily' ? 10 : 2}
              resetAt={activeResetAt}
              label={missionType === 'daily' ? 'missões diárias' : 'missões semanais'}
              rewardedVideoAvailable={
                missionType === 'daily' && (allowance.rewarded_video_available ?? false)
              }
              adState={adState}
              onWatchAd={watchAd}
            />
          )}
        </View>

        {/* ── Box: status + conteúdo ──────────────────────────────────────── */}
        <View className="bg-white border border-[#f0eded] rounded-[20px] overflow-hidden">
          {/* Tabs de status */}
          <View className="px-3 pt-3">
            <MissionsTabs value={tab} onChange={setTab} missionType={missionType} />
          </View>

          <View className="p-3 gap-3">
            {tab === 'available' && (
              <>
                {/* Filtro por especialidade (limitado às que têm missões disponíveis para a trilha do usuário) */}
                {filteredSpecialties.length > 0 && (
                  <SpecialtyFilter
                    specialties={filteredSpecialties}
                    value={specialtyId}
                    onChange={setSpecialtyId}
                  />
                )}

                {isBelowRecruitIV && (
                  <View className="bg-gold/15 border border-gold/40 rounded-[12px] px-4 py-3 flex-row items-center gap-2">
                    <Text className="text-[14px]">⚔️</Text>
                    <Text className="flex-1 text-[12px] text-[#7a5b00] leading-[18px]">
                      Missões de nível médio e difícil são desbloqueadas ao alcançar {unlockRankName}.
                    </Text>
                  </View>
                )}

                {availableQuery.isLoading ? (
                  <View className="py-12 items-center">
                    <ActivityIndicator color="#8B1A2B" />
                  </View>
                ) : availableQuery.isError ? (
                  <ErrorBox text="Não foi possível carregar as missões disponíveis." />
                ) : availableMissions.length === 0 ? (
                  <EmptyBox text="Nenhuma missão disponível para este filtro." />
                ) : (
                  renderList(availableMissions)
                )}
              </>
            )}

            {tab === 'inprogress' && (
              <>
                {inProgressLoading ? (
                  <View className="py-12 items-center">
                    <ActivityIndicator color="#8B1A2B" />
                  </View>
                ) : inProgressError ? (
                  <ErrorBox text="Não foi possível carregar as missões em progresso." />
                ) : inProgressMissions.length === 0 ? (
                  <EmptyBox text="Nenhuma missão em andamento." />
                ) : (
                  renderList(inProgressMissions)
                )}
              </>
            )}

            {tab === 'history' && (
              <>
                {historyLoading ? (
                  <View className="py-12 items-center">
                    <ActivityIndicator color="#8B1A2B" />
                  </View>
                ) : historyError ? (
                  <ErrorBox text="Não foi possível carregar o histórico." />
                ) : historyMissions.length === 0 ? (
                  <EmptyBox text="Você ainda não iniciou nenhuma missão." />
                ) : (
                  renderList(historyMissions)
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <LegionSelectModal
        visible={legionModalVisible}
        legions={legionsQuery.data ?? []}
        recommendedIds={recommendedIds}
        pending={joinLegionM.isPending}
        onClose={() => setLegionModalVisible(false)}
        onConfirm={(legionId) =>
          joinLegionM.mutate(legionId, {
            onSuccess: () => setLegionModalVisible(false),
          })
        }
      />
    </View>
  );
}

function TypeTab({
  label,
  active,
  activeColor = '#9E1B32',
  count,
  onPress,
}: {
  label: string;
  active: boolean;
  activeColor?: string;
  count?: number;
  onPress: () => void;
}) {
  const exhausted = count === 0;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={active ? { backgroundColor: activeColor } : undefined}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px]`}>
      <Text className={`text-[13px] font-bold ${active ? 'text-white' : 'text-white/50'}`}>
        {label}
      </Text>
      {count != null && (
        <View className={`px-1.5 py-0.5 rounded-full ${exhausted ? 'bg-white/10' : 'bg-white/25'}`}>
          <Text className={`text-[10px] font-bold ${exhausted ? 'text-white/30' : 'text-white'}`}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function AllowanceBar({
  remaining,
  max,
  resetAt,
  label,
  rewardedVideoAvailable = false,
  adState = 'idle',
  onWatchAd,
}: {
  remaining: number;
  max: number;
  resetAt?: string;
  label: string;
  rewardedVideoAvailable?: boolean;
  adState?: 'idle' | 'loading' | 'ready' | 'showing' | 'error';
  onWatchAd?: () => void;
}) {
  const resetLabel = React.useMemo(() => {
    if (!resetAt) return null;
    const reset = new Date(resetAt);
    const now = new Date();
    const diffMs = reset.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffM = Math.floor((diffMs % 3_600_000) / 60_000);
    if (diffH >= 24) {
      const days = Math.ceil(diffH / 24);
      return `Renova em ${days} dia${days > 1 ? 's' : ''}`;
    }
    if (diffH > 0) return `Renova em ${diffH}h${diffM > 0 ? ` ${diffM}min` : ''}`;
    return `Renova em ${diffM}min`;
  }, [resetAt]);

  const adButtonLabel =
    adState === 'loading' ? 'Carregando anúncio...'
    : adState === 'showing' ? 'Assistindo...'
    : '▶  Assistir anúncio (+2 missões)';

  const adButtonDisabled = adState === 'loading' || adState === 'showing';

  return (
    <View className="bg-white/10 rounded-[10px] px-4 py-3 gap-2.5">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] font-semibold text-white/40 uppercase tracking-[1px]">
            {label}
          </Text>
          <Text className="text-[13px] font-bold text-white/50 mt-0.5">Cota esgotada</Text>
        </View>
        {resetLabel && (
          <View className="bg-white/15 rounded-[8px] px-3 py-1.5">
            <Text className="text-[11px] font-semibold text-white/70">{resetLabel}</Text>
          </View>
        )}
      </View>

      {rewardedVideoAvailable && (
        <TouchableOpacity
          disabled={adButtonDisabled}
          activeOpacity={0.85}
          onPress={onWatchAd}
          className={`rounded-[9px] py-2.5 items-center flex-row justify-center gap-2 ${
            adButtonDisabled ? 'bg-white/10' : 'bg-[#D4AF37]'
          }`}>
          {adState === 'loading' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : null}
          <Text
            className={`text-[13px] font-bold ${adButtonDisabled ? 'text-white/30' : 'text-[#3d2900]'}`}>
            {adButtonLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <View className="bg-white border border-[#f0eded] rounded-[14px] py-10 items-center px-6">
      <Text className="text-[13px] text-[#999] text-center">{text}</Text>
    </View>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <View className="bg-white border border-[#f0eded] rounded-[14px] py-10 items-center px-6">
      <Text className="text-[13px] text-[#c0392b] text-center">{text}</Text>
    </View>
  );
}
