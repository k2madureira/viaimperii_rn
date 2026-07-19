import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { TrophyIcon } from '../../../../../components/icons';
import { HomeNavigationProp } from '../../../../../navigation/HomeStack';

interface Props {
  count: number;
}

// Card compacto de Conquistas — ocupa ~25% da largura à esquerda do XP total.
// Abre a tela de Conquistas (antes uma aba do footer).
export default function AchievementsCard({ count }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      onPress={() => navigation.navigate('Achievements')}
      className="w-[25%] bg-white border border-[#f0eded] rounded-[16px] px-2 py-3 items-center justify-center">
      <TrophyIcon size={20} color="#9E1B32" strokeWidth={2} />
      <Text className="text-[20px] font-extrabold text-charcoal mt-1 leading-none">{count}</Text>
      <Text
        className="text-[9px] font-bold text-[#888] tracking-[1px] uppercase mt-0.5 text-center"
        numberOfLines={1}>
        {t('nav.achievements')}
      </Text>
    </TouchableOpacity>
  );
}
