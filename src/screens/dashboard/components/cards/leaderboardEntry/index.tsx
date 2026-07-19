import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { MedalIcon } from '../../../../../components/icons';

// Card de entrada para o Placar da Semana (screen `leaderboards`). Fica na Home,
// perto do bloco de ranking all-time. Só navega — sem dados carregados aqui.
interface Props {
  onPress: () => void;
}

const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

export default function LeaderboardEntry({ onPress }: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      accessibilityRole="button"
      className="bg-white border border-[#f0eded] rounded-[18px] p-4 flex-row items-center gap-3.5">
      <View className="w-11 h-11 rounded-[12px] bg-[#FFF8E6] items-center justify-center">
        <MedalIcon place={1} size={26} />
      </View>
      <View className="flex-1">
        <Text className="text-[16px] font-extrabold text-charcoal" style={{ fontFamily: serif }}>
          {t('leaderboards.title')}
        </Text>
        <Text className="text-[12px] text-[#888] mt-0.5">{t('leaderboards.entrySubtitle')}</Text>
      </View>
      <Text className="text-[15px] text-primary-500 leading-none">›</Text>
    </TouchableOpacity>
  );
}
