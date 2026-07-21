import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../../components/text';

interface Props {
  color: string;
  unlocked: boolean;
  onPress: () => void;
}

// Entrada da Sala de Guerra (espiar os números das outras legiões).
//
// Acesso é PAGO e as regras de obtenção ainda não existem no backend — não há
// campo de posse para consultar. Até existirem, o botão fica desabilitado com o
// motivo à vista, em vez de sumir: um botão ausente não ensina que a sala
// existe, e a descoberta é o que vende o acesso depois.
export default function WarRoomButton({ color, unlocked, onPress }: Props) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!unlocked}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: !unlocked }}
      accessibilityLabel={t('legions.warRoom')}
      className={`rounded-[12px] py-3 px-4 flex-row items-center gap-2.5 ${
        unlocked ? '' : 'opacity-45'
      }`}
      style={{ backgroundColor: color }}>
      <Text className="text-[15px]">{unlocked ? '🗺️' : '🔒'}</Text>
      <View className="flex-1">
        <Text className="text-[14px] font-bold text-white">{t('legions.warRoom')}</Text>
        <Text className="text-[11px] text-white/80 mt-0.5">
          {unlocked ? t('legions.warRoomHint') : t('legions.warRoomLocked')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
