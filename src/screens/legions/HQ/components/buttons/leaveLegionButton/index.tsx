import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../../components/text';

interface Props {
  legionName: string;
  onPress: () => void;
}

// Abandonar a legião atual — fecha a tela, longe das ações do dia a dia.
//
// Tom discreto e de risco (sem preenchimento, texto em vermelho) porque a
// ação custa 25% do XP. O modal que ela abre exige escolher a legião de
// destino: o backend não tem "sair para lugar nenhum", só troca.
export default function LeaveLegionButton({ legionName, onPress }: Props) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={t('legions.leaveLegion', { name: legionName })}
      className="rounded-[12px] py-3 items-center border border-error/30">
      <Text className="text-[13px] font-bold text-[#9E1B32]" numberOfLines={1}>
        {t('legions.leaveLegion', { name: legionName })}
      </Text>
    </TouchableOpacity>
  );
}
