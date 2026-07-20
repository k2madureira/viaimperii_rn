import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { TreasuryTransaction } from '../../../../../api/legionTreasury';
import { formatRelativeTime } from '../../../../../utils/date';

interface Props {
  transaction: TreasuryTransaction;
}

// Linha do histórico do cofre: sinal (+/−) pelo `amount`, valor já formatado
// pelo backend (`amount_display`), memo e tempo relativo.
export default function TreasuryTxRow({ transaction }: Props) {
  const { t } = useTranslation();

  const isInflow = transaction.amount >= 0;
  const sign = isInflow ? '+' : '−';
  const amountColor = isInflow ? '#2e7d4f' : '#9E1B32';
  // O sinal é renderizado aqui; remove um sinal já embutido no display para
  // não sair "−−500" caso o backend formate o valor com sinal.
  const amountText = transaction.amount_display.replace(/^[-−+]\s*/, '');

  // Rótulo do tipo de movimento; cai no memo (ou em um genérico) quando o
  // `reference_type` não é um dos conhecidos.
  const referenceKey = transaction.reference_type ?? '';
  const knownLabel = t(`legions.treasury.tx.${referenceKey}`, { defaultValue: '' });
  const label = knownLabel || transaction.memo || t('legions.treasury.tx.movement');

  return (
    <View className="flex-row items-center justify-between bg-[#faf7f7] rounded-[10px] px-3 py-2.5 gap-3">
      <View className="flex-1">
        <Text className="text-[12.5px] font-bold text-[#333]" numberOfLines={1}>
          {label}
        </Text>
        <Text className="text-[11px] text-[#999] mt-0.5">
          {formatRelativeTime(transaction.created_at, t)}
        </Text>
      </View>

      <Text className="text-[13px] font-extrabold" style={{ color: amountColor }}>
        {sign}
        {amountText}
      </Text>
    </View>
  );
}
