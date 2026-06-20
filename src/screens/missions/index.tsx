import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegionSelectModal, Navbar } from '../../components';
import { Mission } from '../../api/missions/missionsApi';
import { StatsPeriod } from '../../api/users/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { XP_PER_RANK } from '../../constants/game';

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

export default function MissionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [period, setPeriod] = useState<StatsPeriod>('monthly');
  const [tab, setTab] = useState<MissionsTab>('available');
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const isHistory = tab === 'history';
  const isInProgress = tab === 'inprogress';

  // Abaixo de Recruta IV (nível 4 → 1500 XP), só missões de nível fácil.
  const isBelowRecruitIV = (user?.total_xp ?? 0) < XP_PER_RANK * 3;
  const forcedDifficulty = isBelowRecruitIV ? 'easy' : null;

  // Reinicia a paginação ao trocar de aba ou especialidade.
  useEffect(() => setVisible(PAGE_SIZE), [tab, specialtyId]);

  const statsQuery = useUserStats(user?.user_id, period);
  const specialtiesQuery = useSpecialties();
  const availableQuery = useAvailableMissions(specialtyId, forcedDifficulty, !isHistory);
  // Histórico = em andamento + concluídas, filtrados pelo backend (status=...).
  const inProgressQuery = useMissions('in_progress', isInProgress);
  const completedQuery = useMissions('completed', isHistory);

  const startM = useStartMission();
  const completeM = useCompleteMission();
  const joinLegionM = useJoinLegion(user?.user_id);
  const legionsQuery = useLegions();

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

  const availableMissions = sortByDifficulty(availableQuery.data?.items ?? []);
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

        {/* Alternância: Disponíveis x Histórico */}
        <MissionsTabs value={tab} onChange={setTab} />

        {(() => {
          switch (tab) {
            case 'available':
              return (
                <>
                  {/* Filtro por especialidade (só nas disponíveis) */}
                  {specialtiesQuery.data && specialtiesQuery.data.length > 0 && (
                    <SpecialtyFilter
                      specialties={specialtiesQuery.data}
                      value={specialtyId}
                      onChange={setSpecialtyId}
                    />
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
              );

            case 'history':
              return (
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
              );

            case 'inprogress': 
              return (
                <>
                  {inProgressLoading ? ( 
                    <View className="py-12 items-center">
                      <ActivityIndicator color="#8B1A2B" />
                    </View>
                  ) : inProgressError ? (
                    <ErrorBox text="Não foi possível carregar  as missões em progresso." />
                  ) : inProgressMissions.length === 0 ? (
                    <EmptyBox text="Nenhuma missão disponível para este filtro." />
                  ) : (
                    renderList(inProgressMissions)
                  )}
                </>
              );

            default:
              return null;
          }
        })()}
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
