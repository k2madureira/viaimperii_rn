import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Legion } from '../../api/legions/legionsApi';
import LegionAttributes from '../legionAttributes';

interface Props {
  visible: boolean;
  legions: Legion[];
  recommendedIds?: number[];
  pending?: boolean;
  onConfirm: (legionId: number) => void;
  onClose: () => void;
}

export default function LegionSelectModal({
  visible,
  legions,
  recommendedIds = [],
  pending = false,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [confirming, setConfirming] = useState(false);

  // Ao abrir, começa na primeira legião recomendada (se houver).
  useEffect(() => {
    if (!visible || legions.length === 0) return;
    const firstRecommended = legions.findIndex((l) => recommendedIds.includes(l.id));
    setIndex(firstRecommended >= 0 ? firstRecommended : 0);
    setConfirming(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, legions.length]);

  const legion = legions[index];
  if (!legion) return null;

  const isRecommended = recommendedIds.includes(legion.id);
  const total = legions.length;

  const go = (dir: -1 | 1) => {
    if (pending) return;
    setIndex((i) => (i + dir + total) % total);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full bg-white rounded-[20px] p-6 items-center">
          <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase">
            {t('legionSelect.chooseTitle')}
          </Text>

          {/* Carrossel: setas + imagem central */}
          <View className="flex-row items-center justify-between w-full mt-4">
            <TouchableOpacity
              onPress={() => go(-1)}
              disabled={total < 2 || pending}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className={`w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea] ${total < 2 ? 'opacity-30' : ''}`}>
              <Text className="text-[22px] text-primary leading-none">‹</Text>
            </TouchableOpacity>

            <View className="flex-1 items-center px-2">
              <View className="w-32 h-32 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden">
                {legion.image_url ? (
                  <Image
                    source={{ uri: legion.image_url }}
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
              className={`w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea] ${total < 2 ? 'opacity-30' : ''}`}>
              <Text className="text-[22px] text-primary leading-none">›</Text>
            </TouchableOpacity>
          </View>

          {/* Nome + badge recomendada */}
          <View className="flex-row items-center mt-4">
            <Text
              className="text-[20px] font-extrabold text-[#111] text-center"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              {legion.name}
            </Text>
          </View>
          {isRecommended && (
            <View className="bg-gold/20 rounded-full px-2.5 py-0.5 mt-1.5">
              <Text className="text-[11px] font-bold text-[#9a7b1f]">{t('legionSelect.recommended')}</Text>
            </View>
          )}

          {/* Descrição abaixo da imagem: intro + Perfil + Missões */}
          <LegionAttributes description={legion.description} />

          {/* Indicadores de posição */}
          {total > 1 && (
            <View className="flex-row gap-1.5 mt-4">
              {legions.map((l, i) => (
                <View
                  key={l.id}
                  className={`h-1.5 rounded-full ${i === index ? 'w-4 bg-primary' : 'w-1.5 bg-[#e0dada]'}`}
                />
              ))}
            </View>
          )}

          {/* Confirmar */}
          <TouchableOpacity
            onPress={() => setConfirming(true)}
            disabled={pending}
            activeOpacity={0.9}
            className="w-full bg-primary rounded-[12px] py-3.5 items-center mt-6">
            <Text className="text-[15px] font-bold text-white">{t('legionSelect.chooseThis')}</Text>
          </TouchableOpacity>

          <Text className="text-[11px] text-[#aaa] text-center mt-3">
            {t('legionSelect.lockNotice')}
          </Text>
        </View>

        {/* Confirmação temática (substitui o Alert nativo) */}
        {confirming && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center px-8">
            <View className="w-full bg-white rounded-[18px] p-6">
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
                  <Text className="text-[22px]">⚔️</Text>
                </View>
                <Text
                  className="text-[18px] font-extrabold text-[#111] text-center"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                  {t('legionSelect.confirmTitle')}
                </Text>
              </View>

              <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
                {t('legionSelect.confirmQuestion', { name: legion.name })}
              </Text>
              <View className="bg-gold/15 rounded-[10px] px-3 py-2.5 mt-3">
                <Text className="text-[12px] text-[#9a7b1f] leading-[17px] text-center">
                  {t('legionSelect.confirmLockNotice')}
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
                  onPress={() => onConfirm(legion.id)}
                  disabled={pending}
                  activeOpacity={0.9}
                  className="flex-1 bg-primary rounded-[12px] py-3 items-center">
                  {pending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-[14px] font-bold text-white">{t('common.confirm')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
