import React, { useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import Text from '../../../components/text';
import ScreenContainer from '../../../components/screenContainer';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../../components';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserProfile } from '../../dashboard/model/queries/useUserProfile';
import { useLegionDetail } from '../../dashboard/model/queries/useLegionDetail';
import { HomeNavigationProp } from '../../../navigation/HomeStack';
import { legionColorById } from '../../../utils/legionColors';
import { useLegions } from '../../missions/model/queries/useLegions';
import { LegionTreasurySection } from '../components/sections';
import ChangeLegionPickerModal from '../components/modals/changeLegionPickerModal';
import {
  LegionHeader,
  HQSkeleton,
  NoLegionState,
  WarRoomButton,
  LeaveLegionButton,
} from './components';
import { HQTerritories } from './components/sections';

// Regras de compra da Sala de Guerra ainda não existem no backend — não há
// campo de posse para ler. Fica em stand-by até o contrato expor algo como
// `war_room_unlocked`, e então esta constante some.
//
// Aberta em DEV para dar como testar a sala; fechada em release para não
// entregar de graça o que vai ser vendido. NÃO trocar por `true` fixo.
const WAR_ROOM_UNLOCKED = __DEV__;

// Quartel General — tela INICIAL da legião. Mostra a legião do próprio viewer
// (derivada do perfil, não de param de rota): carteira, Praefectus e ações do
// cofre no topo, depois as ações da sala e os territórios por país.
export default function LegionHQScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  const { user } = useAuth();

  const [changeOpen, setChangeOpen] = useState(false);

  const profileQuery = useUserProfile(user?.user_id);
  const userLegion = profileQuery.data?.legion ?? null;
  const legionId = userLegion?.id;

  const legionsQuery = useLegions();
  const legions = legionsQuery.data ?? [];
  const color = legionColorById(legions, legionId ?? 0) ?? '#8B1A2B';

  const detailQuery = useLegionDetail(legionId as number);
  const legion = detailQuery.data;

  const totalXp = profileQuery.data?.user?.total_xp ?? user?.total_xp ?? 0;

  const refreshing =
    profileQuery.isFetching || (legionId != null && detailQuery.isFetching);

  const onRefresh = () => {
    profileQuery.refetch();
    if (legionId != null) detailQuery.refetch();
  };

  // Sem legião a sala fica trancada — a legião só é atribuída ao concluir a
  // primeira missão (§14), então isto é progressão pendente, não erro.
  const showLocked = !profileQuery.isLoading && legionId == null;

  return (
    <ScreenContainer>
      <Navbar />

      {profileQuery.isLoading || (legionId != null && detailQuery.isLoading) ? (
        <HQSkeleton />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: insets.bottom + 32,
            gap: 20,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color} />
          }>
          {showLocked ? (
            <NoLegionState />
          ) : detailQuery.isError ? (
            <View className="items-center justify-center gap-3 px-6 py-10">
              <Text className="text-[13px] text-[#888] text-center">
                {t('legions.detailError')}
              </Text>
              <TouchableOpacity
                onPress={() => detailQuery.refetch()}
                className="bg-primary-500 rounded-[12px] px-5 py-2.5">
                <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : legion ? (
            <>
              <LegionHeader legion={legion} color={color} />

              <WarRoomButton
                color={color}
                unlocked={WAR_ROOM_UNLOCKED}
                onPress={() => navigation.navigate('WarRoom')}
              />

              {/* Carteira + Praefectus + ações do cofre (tributo, proposta, voto) */}
              <LegionTreasurySection
                legionId={legion.id}
                legionName={legion.name}
                color={color}
              />

              <HQTerritories countries={legion.countries ?? []} color={color} />

              {/* Abandonar fecha a tela: é destrutivo (−25% XP) e não deve
                  disputar atenção com as ações do dia a dia. */}
              <LeaveLegionButton
                legionName={legion.name}
                onPress={() => setChangeOpen(true)}
              />
            </>
          ) : null}
        </ScrollView>
      )}

      <ChangeLegionPickerModal
        visible={changeOpen}
        legions={legions}
        currentLegionId={legionId ?? null}
        totalXp={totalXp}
        userId={user?.user_id}
        onClose={() => setChangeOpen(false)}
      />
    </ScreenContainer>
  );
}
