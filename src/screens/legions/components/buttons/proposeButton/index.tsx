import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';

interface Props {
  color: string;
  disabled?: boolean;
  onPress: () => void;
}

// Gatilho da loja de estandartes. Só é renderizado pela section quando o viewer
// pode içar (admin, ou líder ainda não descartado por um 403 anterior).
export default function HoistButton({ color, disabled = false, onPress }: Props) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={t('legions.treasury.propose')}
      className={`flex-1 rounded-[12px] py-3 items-center border-2 ${disabled ? 'opacity-35' : ''}`}
      style={{ borderColor: color }}>
      <Text className="text-[13px] font-bold" style={{ color }}>
        {t('legions.treasury.propose')}
      </Text>
    </TouchableOpacity>
  );
}
