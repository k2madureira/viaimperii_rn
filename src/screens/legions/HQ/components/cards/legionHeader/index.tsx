import React from 'react';
import { Image, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../../components/text';
import { Legion } from '../../../../../../api/legion';

interface Props {
  legion: Legion;
  color: string;
}

// Cabeçalho de identidade do Quartel General: brasão, nome e efetivo.
//
// Compacto de propósito — a tela de Legiões já mostra o brasão grande e os
// atributos no card expandido; repetir tudo aqui empurraria carteira, Centurião
// e territórios (o conteúdo próprio do QG) para baixo da dobra.
export default function LegionHeader({ legion, color }: Props) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3">
      <View
        className="w-14 h-14 rounded-full items-center justify-center overflow-hidden"
        style={{ backgroundColor: `${color}10` }}>
        {legion.image_url ? (
          <Image
            source={{ uri: legion.image_url }}
            style={{ width: 48, height: 48 }}
            resizeMode="contain"
          />
        ) : (
          <Text className="text-[26px]">🦅</Text>
        )}
      </View>

      <View className="flex-1">
        <Text
          className="text-[19px] font-extrabold text-[#111]"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
          numberOfLines={1}>
          {legion.name}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <Text className="text-[12px] font-semibold" style={{ color }}>
            {legion.total_users}{' '}
            {legion.total_users === 1 ? t('legions.member') : t('legions.membersPlural')}
          </Text>
        </View>
      </View>
    </View>
  );
}
