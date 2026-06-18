import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { Mission } from '../../api/missions/missionsApi';
import { StatsPeriod } from '../../api/users/userApi';
import { useAuth } from '../../contexts/AuthContext';
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
import { useAvailableMissions } from './model/queries/useAvailableMissions';
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

  // Reinicia a paginação ao trocar de aba ou especialidade.
  useEffect(() => setVisible(PAGE_SIZE), [tab, specialtyId]);

  const statsQuery = useUserStats(user?.user_id, period);
  const specialtiesQuery = useSpecialties();
  const availableQuery = useAvailableMissions(specialtyId, !isHistory);
  // Histórico = em andamento + concluídas, filtrados pelo backend (status=...).
  const inProgressQuery = useMissions('in_progress', isHistory);
  const completedQuery = useMissions('completed', isHistory);

  const startM = useStartMission();
  const completeM = useCompleteMission();

  const pendingSlug = startM.isPending
    ? startM.variables
    : completeM.isPending
      ? completeM.variables
      : null;

  const availableMissions = availableQuery.data?.items ?? [];
  const historyMissions = [
    ...(inProgressQuery.data ?? []),
    ...(completedQuery.data ?? []),
  ];

  const historyLoading = inProgressQuery.isLoading || completedQuery.isLoading;
  const historyError = inProgressQuery.isError || completedQuery.isError;

  const refreshing =
    statsQuery.isRefetching ||
    (isHistory
      ? inProgressQuery.isRefetching || completedQuery.isRefetching
      : availableQuery.isRefetching);

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
      onComplete={(slug) => completeM.mutate(slug)}
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

        {tab === 'available' ? (
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
        ) : (
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
      </ScrollView>
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
