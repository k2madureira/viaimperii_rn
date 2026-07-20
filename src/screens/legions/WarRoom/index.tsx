import React from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import Text from '../../../components/text';
import ScreenContainer from '../../../components/screenContainer';
import { useTranslation } from 'react-i18next';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../../components';
import { useLegionDetail } from '../../dashboard/model/queries/useLegionDetail';
import { HomeStackParamList } from '../../../navigation/HomeStack';
import { legionColorById } from '../../../utils/legionColors';
import { useLegions } from '../../missions/model/queries/useLegions';
import { LegionTreasurySection } from '../components/sections';
import { LegionHeader, WarRoomSkeleton } from './components';
import { WarRoomTerritories } from './components/sections';

type WarRoomRoute = RouteProp<HomeStackParamList, 'WarRoom'>;

// Quartel General da legião: carteira e ações do cofre no topo, Centurião logo
// abaixo (ambos vêm da `LegionTreasurySection`, dona da query do cofre) e os
// territórios por país ao final.
//
// O cofre vive AQUI, não na tela de Legiões: as ações (tributo, proposta, voto)
// só fazem sentido na legião do próprio viewer, e o endpoint exige ser membro.
export default function WarRoomScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { params } = useRoute<WarRoomRoute>();
  const { legionId } = params;

  const detailQuery = useLegionDetail(legionId);
  const legion = detailQuery.data;

  const legionsQuery = useLegions();
  const color = legionColorById(legionsQuery.data, legionId) ?? '#8B1A2B';

  return (
    <ScreenContainer>
      <Navbar />

      {detailQuery.isLoading ? (
        <WarRoomSkeleton />
      ) : detailQuery.isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-[13px] text-[#888] text-center">{t('legions.detailError')}</Text>
          <TouchableOpacity
            onPress={() => detailQuery.refetch()}
            className="bg-primary-500 rounded-[12px] px-5 py-2.5">
            <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : legion ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: insets.bottom + 32,
            gap: 20,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={detailQuery.isFetching}
              onRefresh={() => detailQuery.refetch()}
              tintColor={color}
            />
          }>
          <LegionHeader legion={legion} color={color} />

          {/* Carteira + Centurião + ações do cofre (tributo, proposta, voto) */}
          <LegionTreasurySection legionId={legion.id} legionName={legion.name} color={color} />

          <WarRoomTerritories countries={legion.countries ?? []} color={color} />
        </ScrollView>
      ) : null}
    </ScreenContainer>
  );
}
