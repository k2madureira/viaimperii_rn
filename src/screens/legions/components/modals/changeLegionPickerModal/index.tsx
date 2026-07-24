import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { Legion } from '../../../../../api/legion/dto';
import { TRACK_CHANGE_PENALTY_PCT } from '../../../../../constants/legions';
import { useJoinLegion } from '../../../../missions/model/mutations/useJoinLegion';

interface Props {
  visible: boolean;
  legions: Legion[];
  currentLegionId: number | null;
  totalXp: number;
  userId: string | undefined;
  onClose: () => void;
}

// Troca de legião a partir do Quartel General: carrossel de escolha no padrão
// `LegionSelectModal` (§0.1) + confirmação com a PENALIDADE.
//
// Não dá para reusar o `LegionSelectModal` puro aqui: a cópia dele é de
// primeira escolha e não menciona custo nenhum — o usuário trocaria de legião
// e perderia 25% do XP sem ter sido avisado. Por isso este seletor mostra a
// penalidade no card e de novo na confirmação.
export default function ChangeLegionPickerModal({
  visible,
  legions,
  currentLegionId,
  totalXp,
  userId,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const joinMutation = useJoinLegion(userId);
  const pending = joinMutation.isPending;

  // Ao abrir, começa na primeira legião que NÃO é a atual — trocar para a
  // própria legião não é uma escolha possível.
  useEffect(() => {
    if (!visible || legions.length === 0) return;
    const firstOther = legions.findIndex((l) => l.id !== currentLegionId);
    setIndex(firstOther >= 0 ? firstOther : 0);
    setConfirming(false);
  }, [visible, legions.length, currentLegionId]);

  const legion = legions[index];
  if (!legion) return null;

  const total = legions.length;
  const isCurrent = legion.id === currentLegionId;

  const xpPenalty = Math.floor(totalXp * TRACK_CHANGE_PENALTY_PCT);
  const xpAfter = totalXp - xpPenalty;

  const go = (dir: -1 | 1) => {
    if (pending) return;
    setIndex((i) => (i + dir + total) % total);
  };

  const confirm = () => {
    joinMutation.mutate(legion.id, { onSuccess: onClose });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={pending ? undefined : onClose}
        className="flex-1 bg-black/60 items-center justify-center px-6">
        <Pressable onPress={() => {}} className="w-full bg-white rounded-[20px] p-6 items-center">
          <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase">
            {t('legions.changeLegion')}
          </Text>
          <Text className="text-[12px] text-[#888] text-center mt-1.5 leading-[17px]">
            {t('legions.changePickerHint')}
          </Text>

          {/* Carrossel: setas + brasão central */}
          <View className="flex-row items-center justify-between w-full mt-4">
            <TouchableOpacity
              onPress={() => go(-1)}
              disabled={total < 2 || pending}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className={`w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea] ${
                total < 2 ? 'opacity-30' : ''
              }`}>
              <Text className="text-[22px] text-primary-500 leading-none">‹</Text>
            </TouchableOpacity>

            <View className="flex-1 items-center px-2">
              <View className="w-32 h-32 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden">
                {legion.thumb_url ?? legion.image_url ? (
                  <Image
                    source={{ uri: (legion.thumb_url ?? legion.image_url) as string }}
                    style={{ width: 110, height: 110 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-[40px]">🦅</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => go(1)}
              disabled={total < 2 || pending}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className={`w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea] ${
                total < 2 ? 'opacity-30' : ''
              }`}>
              <Text className="text-[22px] text-primary-500 leading-none">›</Text>
            </TouchableOpacity>
          </View>

          <Text
            className="text-[20px] font-extrabold text-[#111] text-center mt-4"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {legion.name}
          </Text>

          {isCurrent && (
            <View className="bg-laurel/15 rounded-full px-2.5 py-0.5 mt-1.5">
              <Text className="text-[11px] font-bold text-laurel">{t('legions.yourLegion')}</Text>
            </View>
          )}

          {/* Indicadores de posição */}
          {total > 1 && (
            <View className="flex-row gap-1.5 mt-4">
              {legions.map((l, i) => (
                <View
                  key={l.id}
                  className={`h-1.5 rounded-full ${
                    i === index ? 'w-4 bg-primary-500' : 'w-1.5 bg-[#e0dada]'
                  }`}
                />
              ))}
            </View>
          )}

          {/* Custo sempre visível, não só no overlay */}
          <View className="bg-error/10 rounded-[10px] px-3 py-2.5 mt-5 w-full">
            <Text className="text-[11.5px] text-[#7a1a2b] text-center leading-[16px]">
              {t('legions.penaltyDetail', {
                pct: Math.round(TRACK_CHANGE_PENALTY_PCT * 100),
                xpLoss: xpPenalty.toLocaleString(),
                xpAfter: xpAfter.toLocaleString(),
              })}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setConfirming(true)}
            disabled={pending || isCurrent}
            activeOpacity={0.9}
            className={`w-full bg-primary-500 rounded-[12px] py-3.5 items-center mt-4 ${
              isCurrent ? 'opacity-35' : ''
            }`}>
            <Text className="text-[15px] font-bold text-white">
              {t('legions.changeLegionCta')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} disabled={pending} className="mt-3">
            <Text className="text-[12px] text-[#aaa]">{t('common.cancel')}</Text>
          </TouchableOpacity>
        </Pressable>

        {/* Confirmação — toque fora volta ao carrossel */}
        {confirming && (
          <Pressable
            onPress={pending ? undefined : () => setConfirming(false)}
            className="absolute inset-0 bg-black/50 items-center justify-center px-8">
            <Pressable onPress={() => {}} className="w-full bg-white rounded-[18px] p-6">
              <View className="items-center">
                <View className="w-14 h-14 rounded-full bg-error/10 items-center justify-center mb-3">
                  <Text className="text-[26px]">⚠️</Text>
                </View>
                <Text
                  className="text-[18px] font-extrabold text-[#111] text-center"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                  {t('legions.changeConfirmTitle')}
                </Text>
              </View>

              <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
                {t('legions.changeConfirmDesc', { name: legion.name })}
              </Text>

              <View className="bg-error/10 rounded-[10px] px-3 py-2.5 mt-3">
                <Text className="text-[12px] font-bold text-[#7a1a2b] text-center">
                  {t('legions.penaltyTitle')}
                </Text>
                <Text className="text-[12px] text-[#7a1a2b] leading-[17px] text-center mt-1">
                  {t('legions.penaltyDetail', {
                    pct: Math.round(TRACK_CHANGE_PENALTY_PCT * 100),
                    xpLoss: xpPenalty.toLocaleString(),
                    xpAfter: xpAfter.toLocaleString(),
                  })}
                </Text>
              </View>

              <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                  onPress={() => setConfirming(false)}
                  disabled={pending}
                  activeOpacity={0.85}
                  className="flex-1 border border-[#e0dada] rounded-[12px] py-3 items-center">
                  <Text className="text-[14px] font-bold text-[#666]">{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirm}
                  disabled={pending}
                  activeOpacity={0.9}
                  className="flex-1 bg-primary-500 rounded-[12px] py-3 items-center">
                  {pending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-[14px] font-bold text-white">{t('common.confirm')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
}
