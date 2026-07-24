import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { StandardIcon } from '../../../../../components/icons';
import { StandardOption } from '../../../../../api/legionTreasury';

interface Props {
  visible: boolean;
  standards: StandardOption[];
  pending?: boolean;
  onConfirm: (slug: string) => void;
  onClose: () => void;
}

// Loja de estandartes (só o Centurião chega aqui). Carrossel no padrão
// `LegionSelectModal` (§0.1): setas `‹ ›`, imagem central, dots de posição,
// botão primário full-width e overlay de confirmação `absolute inset-0`.
//
// Confirmar aqui ABRE UMA VOTAÇÃO — não compra. O texto do overlay precisa
// deixar isso claro, senão o Centurião espera o buff imediato.
export default function StandardModal({
  visible,
  standards,
  pending = false,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setIndex(0);
    setConfirming(false);
  }, [visible]);

  const standard = standards[index];
  if (!standard) return null;

  const total = standards.length;
  // `affordable` é calculado pelo backend contra o `available` do cofre (saldo
  // MENOS o reservado por uma votação aberta) — não contra o `balance`.
  // `null` = backend não informou; nesse caso não bloqueamos o botão.
  const affordable = standard.affordable !== false;

  const go = (dir: -1 | 1) => {
    if (pending) return;
    setIndex((i) => (i + dir + total) % total);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Toque no backdrop fecha; bloqueado enquanto o içamento está em voo. */}
      <Pressable
        onPress={pending ? undefined : onClose}
        className="flex-1 bg-black/60 items-center justify-center px-6">
        {/* Engole o toque para que tocar no card não feche o modal. */}
        <Pressable onPress={() => {}} className="w-full bg-white rounded-[20px] p-6 items-center">
          <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase">
            {t('legions.treasury.propose')}
          </Text>
          <Text className="text-[12px] text-[#888] text-center mt-1.5 leading-[17px]">
            {t('legions.treasury.proposeHint')}
          </Text>

          {/* Carrossel: setas + emblema central */}
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
              <View className="w-32 h-32 rounded-full bg-accent-500/15 items-center justify-center">
                <StandardIcon size={64} color="#9a7b1f" />
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
            {standard.name}
          </Text>

          {/* Buff + duração */}
          <View className="flex-row items-center gap-2 mt-2">
            <View className="bg-accent-500/20 rounded-full px-2.5 py-0.5">
              <Text className="text-[11px] font-bold text-[#9a7b1f]">
                {t('legions.treasury.xpBoost', { pct: standard.multiplier_pct })}
              </Text>
            </View>
            <View className="bg-[#f4eaea] rounded-full px-2.5 py-0.5">
              <Text className="text-[11px] font-bold text-primary-500">
                {t('legions.treasury.duration', { hours: standard.duration_hours })}
              </Text>
            </View>
          </View>

          {/* Preço (cobrado do cofre) */}
          <View className="bg-[#faf7f7] rounded-[10px] px-3 py-2.5 mt-4 w-full items-center">
            <Text className="text-[11px] text-[#888]">{t('legions.treasury.cost')}</Text>
            <Text className="text-[15px] font-extrabold text-[#111] mt-0.5">
              {standard.price_display}
            </Text>
          </View>

          {!affordable && (
            <Text className="text-[11.5px] text-primary-500 mt-2 text-center">
              {t('legions.treasury.treasuryInsufficient')}
            </Text>
          )}

          {/* Indicadores de posição */}
          {total > 1 && (
            <View className="flex-row gap-1.5 mt-4">
              {standards.map((s, i) => (
                <View
                  key={s.slug}
                  className={`h-1.5 rounded-full ${
                    i === index ? 'w-4 bg-primary-500' : 'w-1.5 bg-[#e0dada]'
                  }`}
                />
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => setConfirming(true)}
            disabled={pending || !affordable}
            activeOpacity={0.9}
            className={`w-full bg-primary-500 rounded-[12px] py-3.5 items-center mt-6 ${
              !affordable ? 'opacity-35' : ''
            }`}>
            <Text className="text-[15px] font-bold text-white">{t('legions.treasury.propose')}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} disabled={pending} className="mt-3">
            <Text className="text-[12px] text-[#aaa]">{t('common.cancel')}</Text>
          </TouchableOpacity>
        </Pressable>

        {/* Confirmação temática (substitui o Alert nativo). Toque fora volta ao
            carrossel — não fecha o modal inteiro. */}
        {confirming && (
          <Pressable
            onPress={pending ? undefined : () => setConfirming(false)}
            className="absolute inset-0 bg-black/50 items-center justify-center px-8">
            <Pressable onPress={() => {}} className="w-full bg-white rounded-[18px] p-6">
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-accent-500/20 items-center justify-center mb-3">
                  <StandardIcon size={24} color="#9a7b1f" />
                </View>
                <Text
                  className="text-[18px] font-extrabold text-[#111] text-center"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                  {t('legions.treasury.proposeConfirm')}
                </Text>
              </View>

              <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
                {t('legions.treasury.proposeConfirmDesc', {
                  name: standard.name,
                  price: standard.price_display,
                })}
              </Text>
              <View className="bg-accent-500/15 rounded-[10px] px-3 py-2.5 mt-3">
                <Text className="text-[12px] text-[#9a7b1f] leading-[17px] text-center">
                  {t('legions.treasury.proposeConfirmNotice', {
                    pct: standard.multiplier_pct,
                    hours: standard.duration_hours,
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
                  onPress={() => onConfirm(standard.slug)}
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
