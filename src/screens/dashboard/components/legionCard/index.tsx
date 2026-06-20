import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { UserLegion } from '../../../../api/users/userApi';

interface Props {
  legion: UserLegion | null;
  // Cor da legião na listagem — mantém consistência entre telas.
  color?: string | null;
  onPress?: () => void;
}

export default function LegionCard({ legion, color, onPress }: Props) {
  // Sem legião: card no mesmo formato, porém vazio/informativo.
  if (!legion) {
    return (
      <View className="bg-laurel rounded-[16px] p-5 min-h-[132px] justify-center">
        <Text className="text-[11px] font-semibold text-white/70 tracking-[3px] uppercase">
          Sua legião
        </Text>
        <View className="h-1.5" />
        <Text
          className="text-[20px] font-extrabold text-white"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          Nenhuma legião
        </Text>
        <Text className="text-[12px] text-white/80 mt-1.5">
          Conclua sua primeira missão para escolher uma legião.
        </Text>
      </View>
    );
  }

  const Wrapper: any = onPress ? TouchableOpacity : View;

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
            Sua legião
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
        <Text className="text-[11px] text-white/70 mt-2">Toque para ver todas as legiões ›</Text>
      ) : null}
    </Wrapper>
  );
}
