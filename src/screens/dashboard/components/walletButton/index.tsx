import React, { useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AsCoin, CoinAmount, DiamondIcon, WalletIcon } from '../../../../components/icons';
import AnchoredPopover, { Anchor } from '../feed/AnchoredPopover';
import { splitCoins } from '../../../../utils/coins';

interface Props {
  balance: number; // valor atômico
}

// Botão de carteira no topo direito da tela: fica oculta por padrão, toque
// abre um popover com o saldo (ícone de diamante no lugar da moeda).
export default function WalletButton({ balance }: Props) {
  const { t } = useTranslation();
  const anchorRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const open = () =>
    anchorRef.current?.measureInWindow((x, y, w, h) => setAnchor({ x, y, width: w, height: h }));

  // "as" que sobra depois de contabilizar aureus e denários (resto < 100).
  const asLeft = splitCoins(balance).find((p) => p.name === 'as')?.count ?? 0;

  return (
    <>
      <View ref={anchorRef} collapsable={false}>
        <TouchableOpacity
          onPress={open}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.walletTitle')}
          className="w-9 h-9 items-center justify-center">
          <WalletIcon size={21} />
        </TouchableOpacity>
      </View>

      <AnchoredPopover anchor={anchor} onClose={() => setAnchor(null)} width={250} align="right">
        <View className="bg-[#6B1221] rounded-[16px] px-4 py-3.5">
          <View className="flex-row items-center">
            <View className="w-11 h-11 rounded-full bg-accent-500/20 items-center justify-center mr-3">
              <DiamondIcon size={24} color="#E8C36B" />
            </View>
            <View className="flex-1" style={{ minWidth: 0 }}>
              <Text className="text-[10px] font-bold text-white/50 tracking-[2px] uppercase">
                {t('dashboard.walletTitle')}
              </Text>
              <View className="mt-1">
                <CoinAmount atomic={balance} size={15} textColor="#E8C36B" showSigla omitAs />
              </View>
            </View>
          </View>

          {/* Total disponível na menor unidade (as) */}
          <View className="flex-row items-center justify-between border-t border-white/10 mt-3 pt-2.5">
            <Text className="text-[11px] text-white/50">{t('dashboard.walletAsLabel')}</Text>
            <View className="flex-row items-center gap-1.5">
              <AsCoin size={14} />
              <Text className="text-[13px] font-extrabold text-white">
                {asLeft.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </AnchoredPopover>
    </>
  );
}
