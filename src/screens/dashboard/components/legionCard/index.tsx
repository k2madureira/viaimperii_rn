import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { UserLegion } from '../../../../api/users/userApi';

interface Props {
  legion: UserLegion | null;
  // Cor da legião na listagem — mantém consistência entre telas.
  color?: string | null;
  onPress?: () => void;
}

export default function LegionCard({ legion, color, onPress }: Props) {
  const { t } = useTranslation();
  const Wrapper: any = onPress ? TouchableOpacity : View;

  // Sem legião: card no mesmo formato, porém vazio/informativo.
  if (!legion) {
    return (
      <Wrapper
        className="bg-laurel rounded-[16px] p-5 min-h-[132px] justify-center"
        {...(onPress ? { onPress, activeOpacity: 0.9 } : {})}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] font-semibold text-white/70 tracking-[3px] uppercase">
            {t('legionCard.yourLegion')}
          </Text>
          {onPress ? <Text className="text-white/60 text-[20px]">›</Text> : null}
        </View>
        <View className="h-1.5" />
        <Text
          className="text-[20px] font-extrabold text-white"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {t('legionCard.noLegion')}
        </Text>
        <Text className="text-[12px] text-white/80 mt-1.5">
          {t('legionCard.completeFirstMission')}
        </Text>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      className="rounded-[16px] p-5 min-h-[132px]"
      style={{ backgroundColor: color ?? '#2F7A52' }}
      {...(onPress ? { onPress, activeOpacity: 0.9 } : {})}>
      <View className="flex-row items-center">
        {/* Insígnia da legião */}
        <View className="w-16 h-16 rounded-full bg-white/15 items-center justify-center mr-4 overflow-hidden">
          {legion.image_url ? (
            <Image
              source={{ uri: legion.image_url }}
              style={{ width: 52, height: 52 }}
              resizeMode="contain"
            />
          ) : (
            <Text className="text-[26px]">🦅</Text>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-[11px] font-semibold text-white/70 tracking-[3px] uppercase">
            {t('legionCard.yourLegion')}
          </Text>
          <View className="h-1" />
          <Text
            className="text-[22px] font-extrabold text-white"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {legion.name}
          </Text>
        </View>

        {onPress ? <Text className="text-white/60 text-[22px] ml-2">›</Text> : null}
      </View>

      {legion.description ? (
        <Text className="text-[12px] text-white/85 leading-[17px] mt-3" numberOfLines={2}>
          {legion.description}
        </Text>
      ) : null}

      {onPress ? (
        <Text className="text-[11px] text-white/70 mt-2">{t('legionCard.tapToSeeAll')}</Text>
      ) : null}
    </Wrapper>
  );
}
