import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ShieldIcon, CoinAmount } from '../../../../../components/icons';
import PulsingShield from '../../effects/pulsingShield';
import { shieldFillRatio, shieldGlowColor } from '../../../../../utils/streakShield';

interface Props {
  visible: boolean;
  shields: number;
  maxShields: number;
  pending: boolean;
  balanceAtomic?: number | null; // saldo gastável atual (atômico) para prévia
  priceDisplay?: string | null; // preço formatado (quando conhecido — ver §9)
  disabled: boolean; // saldo insuficiente detectado numa tentativa anterior
  onConfirm: () => void;
  onClose: () => void;
}

// Compra de Streak Shield — segue o padrão do LegionSelectModal: card central,
// botão primário full-width e overlay de confirmação (absolute inset-0), sem
// Alert nativo.
export default function BuyShieldModal({
  visible,
  shields,
  maxShields,
  pending,
  balanceAtomic,
  priceDisplay,
  disabled,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (!visible) setConfirming(false);
  }, [visible]);

  // Ao resolver a compra (pending true→false) com o modal ABERTO, fecha o overlay
  // de confirmação e volta ao card principal — que já mostra a contagem/fill novos
  // (derivados da query atualizada pela mutation). Em erro não-422 o pai fecha o
  // modal; em 422 o overlay some e o card exibe "saldo insuficiente".
  useEffect(() => {
    if (wasPending.current && !pending) setConfirming(false);
    wasPending.current = pending;
  }, [pending]);

  const question = priceDisplay
    ? t('dashboard.streakShield.buyConfirm', { price: priceDisplay })
    : t('dashboard.streakShield.explain');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full bg-white rounded-[20px] p-6 items-center">
          <View className="w-16 h-16 rounded-full bg-[#eef1f8] items-center justify-center">
            <ShieldIcon size={34} color="#4a5a8a" />
          </View>

          <Text
            className="text-[20px] font-extrabold text-[#111] text-center mt-3"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {t('dashboard.streakShield.title')}
          </Text>

          <Text className="text-[13px] text-[#777] text-center mt-1.5 leading-[19px]">
            {t('dashboard.streakShield.explain')}
          </Text>

          {/* Contagem de escudos */}
          <View className="flex-row items-center gap-1.5 bg-[#f2efef] rounded-full px-3 py-1.5 mt-4">
            <PulsingShield
              size={17}
              fillRatio={shieldFillRatio(shields, maxShields)}
              glowColor={shieldGlowColor(shields, maxShields)}
            />
            <Text className="text-[13px] font-bold text-charcoal">
              {t('dashboard.streakShield.count', { have: shields, max: maxShields })}
            </Text>
          </View>

          {/* Preço (quando conhecido) e saldo atual */}
          {priceDisplay ? (
            <Text className="text-[13px] text-[#555] text-center mt-3">
              {t('dashboard.streakShield.priceLabel', { price: priceDisplay })}
            </Text>
          ) : null}

          {balanceAtomic != null ? (
            <View className="flex-row items-center gap-1.5 mt-2">
              <Text className="text-[12px] text-[#999]">{t('dashboard.streakShield.balance')}</Text>
              <CoinAmount atomic={balanceAtomic} size={14} wrap={false} />
            </View>
          ) : null}

          {/* Botão primário */}
          <TouchableOpacity
            onPress={() => setConfirming(true)}
            disabled={disabled || pending}
            activeOpacity={0.9}
            className="w-full bg-primary-500 rounded-[12px] py-3.5 items-center mt-6"
            style={{ opacity: disabled ? 0.35 : 1 }}>
            <Text className="text-[15px] font-bold text-white">
              {t('dashboard.streakShield.buy')}
            </Text>
          </TouchableOpacity>

          {disabled ? (
            <Text className="text-[11px] text-primary-500 text-center mt-2">
              {t('dashboard.streakShield.insufficient')}
            </Text>
          ) : null}

          <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="mt-3">
            <Text className="text-[13px] font-bold text-[#999]">{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>

        {/* Overlay de confirmação (substitui o Alert nativo) */}
        {confirming && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center px-8">
            <View className="w-full bg-white rounded-[18px] p-6">
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#eef1f8] items-center justify-center mb-3">
                  <ShieldIcon size={26} color="#4a5a8a" />
                </View>
                <Text
                  className="text-[18px] font-extrabold text-[#111] text-center"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                  {t('dashboard.streakShield.title')}
                </Text>
              </View>

              <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
                {question}
              </Text>

              <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                  onPress={() => setConfirming(false)}
                  disabled={pending}
                  activeOpacity={0.85}
                  className="flex-1 border border-[#e0dada] rounded-[12px] py-3 items-center">
                  <Text className="text-[14px] font-bold text-[#666]">{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onConfirm}
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
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
