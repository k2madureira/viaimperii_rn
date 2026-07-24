import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { DenariusCoin } from '../../../../../components/icons';
import { TributeSummary } from '../../../../../api/tributes';

interface Props {
  tributes?: TributeSummary;
}

// Linha discreta de resumo no card ("X em tributos (n)"). Some quando o post
// ainda não recebeu nenhum tributo.
export default function TributeSummaryRow({ tributes }: Props) {
  const { t } = useTranslation();
  if (!tributes || tributes.count === 0) return null;

  return (
    <View className="flex-row items-center gap-1.5">
      <DenariusCoin size={13} />
      <Text className="text-[12px] text-[#9a7b1f] font-bold" numberOfLines={1}>
        {t('tributes.summary', { amount: tributes.total_display, count: tributes.count })}
      </Text>
    </View>
  );
}
