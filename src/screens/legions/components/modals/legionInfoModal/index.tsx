import React from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { LegionAttributes } from '../../../../../components';
import { Legion } from '../../../../../api/legion/dto';

interface Props {
  legion: Legion | null;
  color: string;
  onClose: () => void;
}

// Identidade da legião (brasão, nome e descrição), aberta ao tocar no brasão ou
// no nome de uma linha do ranking.
//
// Substitui o carrossel de brasões que ficava abaixo da tabela: a mesma
// descrição (`LegionAttributes`) que o card expandido mostrava, agora sob
// demanda, sem empurrar o ranking para baixo. Padrão `LegionSelectModal`
// (§0.1): card central sobre `bg-black/60`, fecha no toque fora.
export default function LegionInfoModal({ legion, color, onClose }: Props) {
  const { t } = useTranslation();
  const visible = legion != null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/60 items-center justify-center px-6">
        <Pressable onPress={() => {}} className="w-full bg-white rounded-[20px] p-6 items-center">
          {legion && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center' }}
              style={{ maxHeight: 460 }}>
              <View
                className="w-24 h-24 rounded-full items-center justify-center overflow-hidden"
                style={{ backgroundColor: `${color}10` }}>
                {legion.image_url ?? legion.thumb_url ? (
                  <Image
                    source={{ uri: (legion.image_url ?? legion.thumb_url) as string }}
                    style={{ width: 80, height: 80 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-[40px]">🦅</Text>
                )}
              </View>

              <Text
                className="text-[22px] font-extrabold text-[#111] text-center mt-3"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {legion.name}
              </Text>

              <LegionAttributes description={legion.description} variant="rows" />
            </ScrollView>
          )}

          <Pressable
            onPress={onClose}
            className="w-full bg-primary-500 rounded-[12px] py-3.5 items-center mt-6">
            <Text className="text-[15px] font-bold text-white">{t('common.close')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
