import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '../../../components/text';
import ScreenContainer from '../../../components/screenContainer';
import { Navbar } from '../../../components';
import { HomeStackParamList } from '../../../navigation/HomeStack';
import { GrantedReward, OpenChestResponse } from '../../../api/chests';
import { useChestDetail } from '../model/queries/useChestDetail';
import { useOpenChest } from '../model/mutations/useOpenChest';
import { SlotSelector } from './components';

// Texto de uma recompensa concedida (avatar × missão).
function GrantedRow({ reward }: { reward: GrantedReward }) {
  const { t } = useTranslation();
  const asset = reward.detail.asset;
  const mission = reward.detail.mission;
  return (
    <View className="bg-[#f6f1e7] border border-[#e6d9bf] rounded-[12px] px-4 py-3">
      <Text className="text-[13px] text-[#111] leading-[19px]">
        {asset
          ? t('chests.grantedAvatar', { name: asset.name })
          : t('chests.grantedMission', { name: mission?.name ?? '' })}
      </Text>
    </View>
  );
}

export default function ChestDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'ChestDetail'>>();
  const { userChestId } = route.params;

  const detailQuery = useChestDetail(userChestId);
  const detail = detailQuery.data;

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [granted, setGranted] = useState<OpenChestResponse | null>(null);

  const { mutate: open, isPending } = useOpenChest((data) => {
    setGranted(data);
    setConfirming(false);
  });

  const alreadyOpened = detail?.status === 'opened';
  const allSelected =
    !!detail && detail.slots.length > 0 && detail.slots.every((s) => selections[s.slot_key]);

  const setSlot = (slotKey: string, rewardRef: string) =>
    setSelections((prev) => (prev[slotKey] === rewardRef ? prev : { ...prev, [slotKey]: rewardRef }));

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
        <Text className="text-[16px] font-bold text-[#111] ml-1" numberOfLines={1}>
          {detail?.chest.name ?? t('chests.title')}
        </Text>
      </View>

      {detailQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#9E1B32" />
        </View>
      ) : detailQuery.isError || !detail ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[13px] text-[#999] text-center">{t('chests.detailError')}</Text>
          <TouchableOpacity
            onPress={() => detailQuery.refetch()}
            className="mt-4 bg-primary-500 rounded-[10px] px-5 py-2.5">
            <Text className="text-white font-semibold text-[13px]">{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 12 }}
          showsVerticalScrollIndicator={false}>
          {detail.chest.description ? (
            <Text className="text-[13px] text-[#777] leading-[19px]">{detail.chest.description}</Text>
          ) : null}

          {granted ? (
            // Recém-aberto: recompensas concedidas.
            <View className="gap-3">
              <Text className="text-[17px] font-extrabold text-[#111]">
                {t('chests.grantedTitle')}
              </Text>
              {granted.granted.map((r) => (
                <GrantedRow key={r.slot_key} reward={r} />
              ))}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="bg-primary-500 rounded-[12px] py-3.5 items-center mt-2">
                <Text className="text-white font-bold text-[15px]">{t('chests.done')}</Text>
              </TouchableOpacity>
            </View>
          ) : alreadyOpened ? (
            // Já aberto antes: mostra o que foi escolhido (options vem vazio).
            <View className="gap-3">
              <Text className="text-[15px] font-bold text-[#111]">{t('chests.grantedTitle')}</Text>
              {detail.selections.map((s) => (
                <View
                  key={s.slot_key}
                  className="bg-white border border-[#eee] rounded-[12px] px-4 py-3">
                  <Text className="text-[13px] text-[#111]">
                    {s.asset
                      ? t('chests.grantedAvatar', { name: s.asset.name })
                      : t('chests.grantedMission', { name: s.mission?.name ?? '' })}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            // Fechado: seletor por slot + abrir.
            <View className="gap-3">
              {detail.slots.map((slot) => (
                <SlotSelector
                  key={slot.slot_key}
                  slot={slot}
                  selectedRef={selections[slot.slot_key] ?? null}
                  onSelect={(ref) => setSlot(slot.slot_key, ref)}
                />
              ))}

              <TouchableOpacity
                onPress={() => setConfirming(true)}
                disabled={!allSelected}
                activeOpacity={0.9}
                className={`rounded-[12px] py-3.5 items-center mt-1 ${allSelected ? 'bg-primary-500' : 'bg-[#d9b3ba]'}`}>
                <Text className="text-white font-bold text-[15px]">{t('chests.openCta')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Confirmação (substitui Alert nativo, §0.1) */}
      {confirming ? (
        <View className="absolute inset-0 bg-black/60 items-center justify-center px-8">
          <View className="w-full bg-white rounded-[18px] p-6">
            <Text className="text-[18px] font-extrabold text-[#111] text-center">
              {t('chests.confirmOpenTitle')}
            </Text>
            <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
              {t('chests.confirmOpenBody')}
            </Text>
            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity
                onPress={() => setConfirming(false)}
                disabled={isPending}
                activeOpacity={0.85}
                className="flex-1 border border-[#e0dada] rounded-[12px] py-3 items-center">
                <Text className="text-[14px] font-bold text-[#666]">{t('chests.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => open({ userChestId, selections })}
                disabled={isPending}
                activeOpacity={0.9}
                className="flex-1 bg-primary-500 rounded-[12px] py-3 items-center">
                {isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-[14px] font-bold text-white">{t('chests.confirmOpen')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
