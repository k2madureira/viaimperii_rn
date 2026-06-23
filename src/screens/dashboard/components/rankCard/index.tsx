import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  rank: string;
  totalXp: number;
  xpToNextRank: number;
  progressPct?: number | null; // progresso na faixa (0..100), calculado no backend
  imageUrl?: string | null;
  trackName?: string | null;
  onPress?: () => void;
}

export default function RankCard({
  rank,
  totalXp,
  xpToNextRank,
  progressPct,
  imageUrl,
  trackName,
  onPress,
}: Props) {
  const { t } = useTranslation();
  const isMaxRank = xpToNextRank <= 0;
  // Progresso dentro da faixa da patente — usa o valor do backend quando disponível.
  const progress =
    progressPct != null
      ? Math.min(1, progressPct / 100)
      : isMaxRank
        ? 1
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
            {t('rankCard.yourRank')}
          </Text>
          <View className="h-1" />
          <Text
            className="text-[24px] font-extrabold text-white"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {rank}
          </Text>

          {/* Trilha selecionada — vazio enquanto o usuário não escolher */}
          {trackName ? (
            <View className="flex-row mt-1.5">
              <View className="flex-row items-center bg-gold/20 rounded-full px-2.5 py-0.5">
                <View className="w-1.5 h-1.5 rounded-full bg-gold mr-1.5" />
                <Text className="text-[11px] font-bold text-gold">{trackName}</Text>
              </View>
            </View>
          ) : null}
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
        <Text className="text-[12px] text-white/80">{totalXp.toLocaleString()} {t('common.xp')}</Text>
        <Text className="text-[12px] text-white/80">
          {isMaxRank ? t('rankCard.maxRank') : t('rankCard.xpRemaining', { xp: xpToNextRank.toLocaleString() })}
        </Text>
      </View>
    </Wrapper>
  );
}
