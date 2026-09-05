import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import Text from '../../../components/text';
import ScreenContainer from '../../../components/screenContainer';
import { useTranslation } from 'react-i18next';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../../components';
import { HomeStackParamList } from '../../../navigation/HomeStack';
import { useLegionTreasury } from '../model/queries/useLegionTreasury';
import { TreasuryTxRow, EmptyBox, ErrorState } from '../components';

// Movimentações do cofre (doações + gastos) — tela dedicada. Extraída do Quartel
// General, onde a lista completa tomava espaço demais e empurrava as ações do
// cofre para baixo. Reusa a mesma query do cofre (mesma key, sem custo extra).
export default function LegionDonationsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'LegionDonations'>>();
  const { legionId, legionName, color = '#8B1A2B' } = route.params;

  const treasuryQuery = useLegionTreasury(legionId, legionId != null);
  const transactions = treasuryQuery.data?.transactions ?? [];

  return (
    <ScreenContainer>
      <Navbar />

      <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#f0f0f0]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-8 h-8 items-center justify-center -ml-1"
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}>
          <Text className="text-[24px] text-[#111] leading-none">‹</Text>
        </TouchableOpacity>
        <View className="ml-1">
          <Text className="text-[16px] font-bold text-[#111]">{t('legions.donations.title')}</Text>
          {legionName ? (
            <Text className="text-[11px] text-[#999]">{legionName}</Text>
          ) : null}
        </View>
      </View>

      {treasuryQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={color} />
        </View>
      ) : treasuryQuery.isError ? (
        <View className="flex-1 px-5 pt-6">
          <ErrorState onRetry={() => treasuryQuery.refetch()} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 8 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={treasuryQuery.isFetching}
              onRefresh={() => treasuryQuery.refetch()}
              tintColor={color}
            />
          }>
          {transactions.length === 0 ? (
            <EmptyBox text={t('legions.treasury.empty')} />
          ) : (
            transactions.map((tx, i) => <TreasuryTxRow key={`${tx.created_at}-${i}`} transaction={tx} />)
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
