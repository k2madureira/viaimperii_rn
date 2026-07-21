import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../../components/text';

interface Props {
  color: string;
  warRoomUnlocked: boolean;
  onOpenWarRoom: () => void;
  onChangeLegion: () => void;
}

// Ações do Quartel General: entrar na Sala de Guerra (espiar as outras legiões)
// e trocar de legião.
//
// A Sala de Guerra é PAGA e as regras de obtenção ainda não existem no backend
// — não há campo de posse para consultar. Até existirem, o botão fica desabilitado
// com o motivo à vista, em vez de sumir: um botão ausente não ensina que a sala
// existe, e a descoberta é o que vende o acesso depois.
export default function HQActions({
  color,
  warRoomUnlocked,
  onOpenWarRoom,
  onChangeLegion,
}: Props) {
  const { t } = useTranslation();

  return (
    <View className="gap-2.5">
      <TouchableOpacity
        onPress={onOpenWarRoom}
        disabled={!warRoomUnlocked}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ disabled: !warRoomUnlocked }}
        accessibilityLabel={t('legions.warRoom')}
        className={`rounded-[12px] py-3 px-4 flex-row items-center gap-2.5 ${
          warRoomUnlocked ? '' : 'opacity-45'
        }`}
        style={{ backgroundColor: color }}>
        <Text className="text-[15px]">{warRoomUnlocked ? '🗺️' : '🔒'}</Text>
        <View className="flex-1">
          <Text className="text-[14px] font-bold text-white">{t('legions.warRoom')}</Text>
          <Text className="text-[11px] text-white/80 mt-0.5">
            {warRoomUnlocked ? t('legions.warRoomHint') : t('legions.warRoomLocked')}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onChangeLegion}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t('legions.changeLegion')}
        className="rounded-[12px] py-3 items-center border-2"
        style={{ borderColor: color }}>
        <Text className="text-[14px] font-bold" style={{ color }}>
          {t('legions.changeLegion')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
