import React from 'react';
import { Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { CoinAmount, StandardIcon, TreasuryIcon } from '../../../../../components/icons';
import { ActiveStandard } from '../../../../../api/legionTreasury';
import { formatCountdown, useStandardCountdown } from '../../../model/hooks/useStandardCountdown';

interface Props {
  balance: number;
  reserved: number;
  available: number;
  activeStandard: ActiveStandard | null;
  color: string;
}

// Cabeçalho do Cofre da Legião: saldo + faixa do estandarte ativo (nome,
// multiplicador e countdown client-side de `remaining_seconds`).
//
// Os três números só aparecem quando há RESERVA: sem votação aberta,
// `available === balance` e mostrar as três linhas seria ruído. Com reserva, o
// travado precisa estar visível — senão o usuário acha que sumiu dinheiro.
export default function TreasuryCard({
  balance,
  reserved,
  available,
  activeStandard,
  color,
}: Props) {
  const { t } = useTranslation();
  const remaining = useStandardCountdown(activeStandard?.remaining_seconds);
  const hasReserve = reserved > 0;

  return (
    <View className="gap-3">
      {/* Saldo do cofre */}
      <View className="flex-row items-center gap-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}14` }}>
          <TreasuryIcon size={22} color={color} />
        </View>

        <View className="flex-1">
          <Text
            className="text-[15px] font-extrabold text-[#111]"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {t('legions.treasury.title')}
          </Text>
          <Text className="text-[11px] text-[#999] mt-0.5">{t('legions.treasury.balance')}</Text>
        </View>

        <CoinAmount atomic={balance} size={17} compact />
      </View>

      {/* Quebra do saldo — só com votação aberta segurando parte do cofre. */}
      {hasReserve && (
        <View className="bg-[#faf7f7] rounded-[12px] px-3 py-2.5 gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11.5px] text-[#888]">{t('legions.treasury.reserved')}</Text>
            <CoinAmount atomic={reserved} size={12.5} compact />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-[11.5px] font-bold text-[#555]">
              {t('legions.treasury.available')}
            </Text>
            <CoinAmount atomic={available} size={12.5} compact />
          </View>
          <Text className="text-[10.5px] text-[#aaa] leading-[14px] mt-0.5">
            {t('legions.treasury.reservedHint')}
          </Text>
        </View>
      )}

      {/* Estandarte ativo (buff de XP para toda a legião) */}
      {activeStandard && (
        <View className="bg-accent-500/15 rounded-[12px] px-3 py-2.5 flex-row items-center gap-2.5">
          <StandardIcon size={22} color="#9a7b1f" />
          <View className="flex-1">
            <Text className="text-[12px] font-bold text-[#9a7b1f]">
              {t('legions.treasury.activeStandard')}: {activeStandard.name}
            </Text>
            <Text className="text-[11px] text-[#9a7b1f]/80 mt-0.5">
              {t('legions.treasury.xpBoost', { pct: activeStandard.multiplier_pct })} ·{' '}
              {t('legions.treasury.remaining', { time: formatCountdown(remaining) })}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
