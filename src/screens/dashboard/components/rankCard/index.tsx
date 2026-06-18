import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  rank: string;
  totalXp: number;
  xpToNextRank: number;
  imageUrl?: string | null;
  onPress?: () => void;
}

export default function RankCard({ rank, totalXp, xpToNextRank, imageUrl, onPress }: Props) {
  const isMaxRank = xpToNextRank <= 0;
  // Progresso até a próxima patente com base nos valores da API.
  const progress = isMaxRank
    ? 1
    : totalXp > 0
      ? Math.min(1, totalXp / (totalXp + xpToNextRank))
      : 0;

  const Wrapper: any = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      className="bg-primary rounded-[16px] p-5"
      {...(onPress ? { onPress, activeOpacity: 0.9 } : {})}>
      <View className="flex-row items-center">
        {/* Insígnia da patente */}
        {imageUrl ? (
          <View className="w-16 h-16 rounded-full bg-white/15 items-center justify-center mr-4 overflow-hidden">
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 52, height: 52 }}
              resizeMode="contain"
            />
          </View>
        ) : null}

        <View className="flex-1">
          <Text className="text-[11px] font-semibold text-white/70 tracking-[3px] uppercase">
            Sua patente
          </Text>
          <View className="h-1" />
          <Text
            className="text-[24px] font-extrabold text-white"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {rank}
          </Text>
        </View>

        {onPress ? <Text className="text-white/60 text-[22px] ml-2">›</Text> : null}
      </View>

      <View className="h-4" />

      {/* Barra de progresso da patente */}
      <View className="h-[6px] bg-white/25 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full bg-gold"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      <View className="h-2" />

      <View className="flex-row justify-between">
        <Text className="text-[12px] text-white/80">{totalXp.toLocaleString('pt-BR')} XP</Text>
        <Text className="text-[12px] text-white/80">
          {isMaxRank ? 'Patente máxima' : `Faltam ${xpToNextRank.toLocaleString('pt-BR')} XP`}
        </Text>
      </View>
    </Wrapper>
  );
}
