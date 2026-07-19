import React from 'react';
import { Image, Modal, Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  previousRank?: string;
  previousImage?: string | null;
  newRank: string;
  newImage?: string | null;
  onClose: () => void;
}

const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

/**
 * Modal de promoção de patente (padrão do app): parabeniza e mostra a patente
 * anterior → a nova, com as respectivas imagens. Disparado quando `promoted` na
 * conclusão de uma missão.
 */
export default function RankUpModal({
  visible,
  previousRank,
  previousImage,
  newRank,
  newImage,
  onClose,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full bg-white rounded-[20px] p-6 items-center">
          <View className="w-14 h-14 rounded-full bg-accent-500/15 items-center justify-center mb-2">
            <Text className="text-[26px]">🎖️</Text>
          </View>
          <Text
            className="text-[19px] font-extrabold text-charcoal text-center"
            style={{ fontFamily: serif }}>
            {t('rankUp.title')}
          </Text>
          <Text className="text-[13px] text-[#888] text-center mt-1">{t('rankUp.subtitle')}</Text>

          {/* Patente anterior → nova */}
          <View className="flex-row items-center justify-center gap-3 mt-5">
            {previousRank ? (
              <View className="items-center" style={{ width: 88 }}>
                <View className="w-14 h-14 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden">
                  {previousImage ? (
                    <Image
                      source={{ uri: previousImage }}
                      style={{ width: 46, height: 46, opacity: 0.5 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text className="text-[22px] opacity-40">🎖️</Text>
                  )}
                </View>
                <Text className="text-[11px] text-[#999] mt-1 text-center" numberOfLines={2}>
                  {previousRank}
                </Text>
              </View>
            ) : null}

            <Text className="text-[20px] text-primary-500 leading-none">→</Text>

            <View className="items-center" style={{ width: 96 }}>
              <View className="w-[72px] h-[72px] rounded-full bg-accent-500/10 items-center justify-center overflow-hidden border border-accent-500/40">
                {newImage ? (
                  <Image
                    source={{ uri: newImage }}
                    style={{ width: 60, height: 60 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-[28px]">🏛️</Text>
                )}
              </View>
              <Text
                className="text-[13px] font-extrabold text-primary-500 mt-1 text-center"
                numberOfLines={2}>
                {newRank}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.9}
            className="w-full bg-primary-500 rounded-[12px] py-3.5 items-center mt-6">
            <Text className="text-[15px] font-bold text-white">{t('rankUp.continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
