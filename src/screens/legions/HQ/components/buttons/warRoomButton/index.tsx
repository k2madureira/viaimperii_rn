import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../../components/text';
import { formatCountdown } from '../../../../model/hooks/useStandardCountdown';

interface Props {
  color: string;
  unlocked: boolean;
  remainingSeconds: number;
  onPress: () => void;
}

// Entrada da Sala de Guerra.
//
// SEMPRE navegável, mesmo sem acesso. O gate é no CONTEÚDO, não na porta: o
// backend censura o board no servidor (`access: preview`) e devolve três linhas
// gratuitas justamente para a tela poder ser mostrada a quem não comprou.
//
// Travar a navegação criava um impasse — o CTA que abre a votação de compra
// vive DENTRO do board, então trancar a porta tornava a sala impossível de
// adquirir. E a prévia é o que vende o acesso; escondê-la remove o anúncio.
export default function WarRoomButton({ color, unlocked, remainingSeconds, onPress }: Props) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={t('legions.warRoom')}
      className="rounded-[12px] py-3 px-4 flex-row items-center gap-2.5"
      style={{ backgroundColor: color }}>
      <Text className="text-[15px]">{unlocked ? '🗺️' : '🔍'}</Text>

      <View className="flex-1">
        <Text className="text-[14px] font-bold text-white">{t('legions.warRoom')}</Text>
        <Text className="text-[11px] text-white/80 mt-0.5">
          {unlocked
            ? t('legions.warRoomActive', { time: formatCountdown(remainingSeconds) })
            : t('legions.warRoomPreview')}
        </Text>
      </View>

      <Text className="text-[16px] text-white/60">›</Text>
    </TouchableOpacity>
  );
}
