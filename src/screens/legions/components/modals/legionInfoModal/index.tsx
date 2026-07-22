import React from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { LegionAttributes } from '../../../../../components';
import { Legion } from '../../../../../api/legion/dto';
import { darken, isDark, withAlpha } from '../../../../../utils/color';

interface Props {
  legion: Legion | null;
  color: string;
  onClose: () => void;
}

// Identidade da legião (brasão, nome e descrição), aberta ao tocar no brasão ou
// no nome de uma linha do ranking. Substitui o carrossel que ficava abaixo da
// tabela.
//
// Estrutura em 3 faixas para NÃO cortar conteúdo: cabeçalho colorido (altura
// fixa), corpo ROLÁVEL (encolhe até o teto do card) e rodapé fixo — assim a
// descrição rola entre um título e um botão sempre visíveis, em qualquer tela.
//
// Cores derivadas da cor da legião (`src/utils/color.ts`): cabeçalho escuro o
// suficiente para texto branco (mesmo em legiões de cor clara como a dourada),
// corpo branco e realces em tints da mesma cor — um só tom, equilibrado.
export default function LegionInfoModal({ legion, color, onClose }: Props) {
  const { t } = useTranslation();
  const visible = legion != null;

  // Fundo do cabeçalho: a própria cor se já for escura, senão escurecida para o
  // texto branco manter contraste. `onHeader` é sempre branco por consequência.
  const headerBg = isDark(color) ? color : darken(color, 0.3);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/60 items-center justify-center px-6">
        {/* `maxHeight` + coluna: o corpo encolhe e rola; header/rodapé ficam. */}
        <Pressable
          onPress={() => {}}
          className="w-full bg-white rounded-[22px] overflow-hidden"
          style={{ maxHeight: '82%' }}>
          {legion && (
            <>
              {/* Cabeçalho colorido */}
              <View className="items-center px-6 pt-7 pb-6" style={{ backgroundColor: headerBg }}>
                <View
                  className="w-24 h-24 rounded-full items-center justify-center overflow-hidden"
                  style={{ backgroundColor: withAlpha('#FFFFFF', 0.16) }}>
                  {legion.image_url ?? legion.thumb_url ? (
                    <Image
                      source={{ uri: (legion.image_url ?? legion.thumb_url) as string }}
                      style={{ width: 82, height: 82 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text className="text-[40px]">🦅</Text>
                  )}
                </View>

                <Text
                  className="text-[22px] font-extrabold text-white text-center mt-3"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                  {legion.name}
                </Text>
              </View>

              {/* Corpo rolável — a descrição inteira, sem corte */}
              <ScrollView
                style={{ flexShrink: 1 }}
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}>
                <LegionAttributes description={legion.description} variant="rows" />
              </ScrollView>

              {/* Rodapé fixo */}
              <View
                className="px-6 pt-3 pb-5"
                style={{ borderTopWidth: 1, borderTopColor: withAlpha(color, 0.12) }}>
                <Pressable
                  onPress={onClose}
                  className="w-full rounded-[12px] py-3.5 items-center"
                  style={{ backgroundColor: color }}>
                  <Text className="text-[15px] font-bold" style={{ color: isDark(color) ? '#FFFFFF' : '#1a1a1a' }}>
                    {t('common.close')}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
