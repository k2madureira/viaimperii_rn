import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/screenContainer';
import Navbar from '../../components/navbar';
import Text from '../../components/text';
import { useAuth } from '../../contexts/AuthContext';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { pickClanEmblem } from '../../utils/clanEmblem';
import { useUserClan } from './model/queries/useUserClan';
import { useClanDetail } from './model/queries/useClanDetail';
import { useLeaveClan } from './model/mutations/useLeaveClan';
import { useSetClanEmblem } from './model/mutations/useSetClanEmblem';
import {
  ClanHeader,
  ClanJoinAction,
  ClanMembers,
  ClanRequestQueue,
} from './components/sections';

// Tela do clã. Sem `clanId` no param → mostra o clã do usuário logado (entrada pelo
// card do Perfil). Com `clanId` → detalhe de um clã do diretório.
export default function ClanScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<HomeStackParamList, 'Clan'>>();
  const { user } = useAuth();
  const [confirmLeave, setConfirmLeave] = useState(false);

  const clanId = route.params?.clanId;
  const userClanQuery = useUserClan(clanId ? undefined : user?.user_id);
  const detailQuery = useClanDetail(clanId);
  const leaveM = useLeaveClan();
  const setEmblemM = useSetClanEmblem();

  const isDetail = !!clanId;
  const query = isDetail ? detailQuery : userClanQuery;
  const clan = isDetail ? detailQuery.data : userClanQuery.data?.clan ?? null;
  const isMember = !!clan?.my_rank_level;
  // Capitão+ (rank_level ≥ 2) gerencia a fila de solicitações.
  const canManageRequests = (clan?.my_rank_level ?? 0) >= 2;
  // Só o marechal (rank_level 5) troca o emblema.
  const isMarshal = clan?.my_rank_level === 5;

  const onEditEmblem = async () => {
    if (!clan) return;
    try {
      const uri = await pickClanEmblem();
      if (!uri) return;
      setEmblemM.mutate(
        { clanId: clan.id, uri },
        {
          onError: (e) =>
            Toast.show({
              type: 'error',
              text1: t('clan.toasts.emblemError'),
              text2: e instanceof Error ? e.message : undefined,
            }),
        },
      );
    } catch (e) {
      // Erros previsíveis do picker (permissão / arquivo grande) já vêm traduzidos.
      Toast.show({
        type: 'error',
        text1: e instanceof Error ? e.message : t('clan.toasts.emblemError'),
      });
    }
  };

  const onLeave = () => {
    if (!clan) return;
    leaveM.mutate(clan.id, {
      onSuccess: () => {
        setConfirmLeave(false);
        navigation.goBack();
      },
    });
  };

  return (
    <ScreenContainer>
      <Navbar />

      <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#f0f0f0]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-8 h-8 items-center justify-center -ml-1"
          activeOpacity={0.7}>
          <Text className="text-[24px] text-[#111] leading-none">‹</Text>
        </TouchableOpacity>
        <Text className="text-[16px] font-bold text-[#111] ml-1">{t('clan.title')}</Text>
      </View>

      {query.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#9E1B32" />
        </View>
      ) : !clan ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[15px] text-[#888] text-center">{t('clan.empty')}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching}
              onRefresh={() => query.refetch()}
              tintColor="#9E1B32"
            />
          }>
          <ClanHeader
            clan={clan}
            canEditEmblem={isMarshal}
            emblemUploading={setEmblemM.isPending}
            onEditEmblem={onEditEmblem}
          />

          {/* Não-membro (vindo do diretório): pode solicitar ingresso. */}
          {!isMember && <ClanJoinAction clan={clan} />}

          {/* Oficial (capitão+): fila de solicitações pendentes. */}
          {isMember && <ClanRequestQueue clanId={clan.id} canManage={canManageRequests} />}

          <ClanMembers members={clan.members} />

          {isMember && (
            <TouchableOpacity
              className="bg-white border border-[#f0d5d5] rounded-[14px] py-3.5 items-center"
              activeOpacity={0.8}
              onPress={() => setConfirmLeave(true)}>
              <Text className="text-[14px] font-bold text-red-500">{t('clan.leave.action')}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {confirmLeave && clan && (
        <View className="absolute inset-0 bg-black/60 items-center justify-center px-8">
          <View className="bg-white rounded-[20px] p-6 w-full">
            <Text className="text-[17px] font-bold text-[#111] text-center">
              {t('clan.leave.confirmTitle')}
            </Text>
            <Text className="text-[13px] text-[#666] text-center mt-2 leading-[19px]">
              {t('clan.leave.confirmBody')}
            </Text>
            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity
                className="flex-1 border border-[#e5e5e5] rounded-[14px] py-3 items-center"
                activeOpacity={0.8}
                disabled={leaveM.isPending}
                onPress={() => setConfirmLeave(false)}>
                <Text className="text-[14px] font-semibold text-[#555]">{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary-700 rounded-[14px] py-3 items-center"
                activeOpacity={0.85}
                disabled={leaveM.isPending}
                onPress={onLeave}>
                {leaveM.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-[14px] font-bold text-white">{t('clan.leave.confirm')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
