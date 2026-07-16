import React from 'react';
import { View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';

interface Props {
  totalXp: number;
}

// Destaque do XP total — o detalhe de progresso/próxima patente fica no RankCard abaixo.
export default function XpProgress({ totalXp }: Props) {
  const { t } = useTranslation();
  return (
    <View className="bg-[#6B1221] rounded-[16px] px-5 py-4 flex-row items-center justify-between">
      <Text className="text-[10px] font-bold text-white/40 tracking-[2px] uppercase">
        {t('profile.totalXp')}
      </Text>
      <Text className="text-[26px] font-extrabold text-accent-500">
        {totalXp.toLocaleString()}
        <Text className="text-[13px] font-bold text-white/30"> {t('common.xp')}</Text>
      </Text>
    </View>
  );
}
