import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { DenariusCoin } from '../../../../../components/icons';
import { TributeSummary } from '../../../../../api/tributes';

interface Props {
  tributes?: TributeSummary;
  onPress: () => void;
}

// Ação "Tributar" na barra do FeedCard, ao lado de reagir/comentar. Divide a
// barra em três, então o rótulo fica curto e fixo: o estado "já tributei" é
// sinalizado pelo dourado + contador, e a frase inteira (`alreadyTributed`) vai
// para o modal, onde há largura. Tributar de novo continua permitido — o
// backend só limita o cap diário.
export default function TributeButton({ tributes, onPress }: Props) {
  const { t } = useTranslation();
  const mine = (tributes?.mine ?? 0) > 0;
  const count = tributes?.count ?? 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={mine ? t('tributes.alreadyTributed') : t('tributes.action')}
      className="flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-[10px]">
      <DenariusCoin size={18} />
      <Text
        className={`text-[13px] font-bold ${mine ? 'text-[#9a7b1f]' : 'text-[#666]'}`}
        numberOfLines={1}>
        {t('tributes.action')}
      </Text>
      {count > 0 && (
        <View className="bg-accent-500/20 rounded-full px-1.5">
          <Text className="text-[11px] font-bold text-[#9a7b1f]">{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
