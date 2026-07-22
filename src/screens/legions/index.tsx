import React from 'react';
import ScreenContainer from '../../components/screenContainer';
import { RefreshControl, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useLegions } from '../missions/model/queries/useLegions';
import { LegionBoardSection } from './components/sections';

// War Room — sala de inteligência (acesso pago): compara as legiões entre si.
//
// O RANKING é a tela inteira. A identidade de cada legião (brasão + descrição)
// abre em modal ao tocar no brasão ou no nome de uma linha — antes era um
// carrossel abaixo da tabela, que empurrava os números para baixo e repetia o
// que o Quartel General já mostra.
export default function WarRoomScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const profileQuery = useUserProfile(user?.user_id);
  const userLegion = profileQuery.data?.legion ?? null;

  const legionsQuery = useLegions();
  const legions = legionsQuery.data ?? [];

  return (
    <ScreenContainer>
      <Navbar />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: insets.bottom + 32,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={legionsQuery.isFetching || profileQuery.isFetching}
            onRefresh={() => {
              legionsQuery.refetch();
              profileQuery.refetch();
            }}
            tintColor="#9E1B32"
          />
        }>
        <LegionBoardSection
          province={profileQuery.data?.province ?? null}
          viewerLegionId={userLegion?.id ?? null}
          legions={legions}
          color="#9E1B32"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
