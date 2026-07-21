import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';

interface Props {
  color: string;
  onPress: () => void;
}

// Gatilho do modal de tributo ao cofre (ação primária do bloco).
export default function DonateButton({ color, onPress }: Props) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={t('legions.treasury.donate')}
      className="flex-1 rounded-[12px] py-3 items-center"
      style={{ backgroundColor: color }}>
      <Text className="text-[13px] font-bold text-white">{t('legions.treasury.donate')}</Text>
    </TouchableOpacity>
  );
}
