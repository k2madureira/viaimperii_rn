import React, { useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import {
  AsCoin,
  AureusCoin,
  CoinAmount,
  CoinPurseIcon,
  DenariusCoin,
  WalletIcon,
} from '../../../../../components/icons';
import AnchoredPopover, { Anchor } from '../../feed/AnchoredPopover';
import { splitCoins } from '../../../../../utils/coins';

interface Props {
  balance: number; // valor atômico
}

// Linha de conversão do painel de ajuda: ícone da moeda + nome + regra de conversão.
function HelpRow({
  icon,
  name,
  rule,
}: {
  icon: React.ReactNode;
  name: string;
  rule: string;
}) {
  return (
    <View className="flex-row items-center py-1.5">
      <View className="w-6 items-center mr-2.5">{icon}</View>
      <View className="flex-1" style={{ minWidth: 0 }}>
        <Text className="text-[12px] font-extrabold text-white">{name}</Text>
        <Text className="text-[11px] text-white/60">{rule}</Text>
      </View>
    </View>
  );
}

// Botão de carteira no topo direito da tela: fica oculta por padrão, toque
// abre um popover com o saldo (ícone de bolsa de moedas). Um "?" no cabeçalho
// alterna a explicação das moedas e suas conversões.
export default function WalletButton({ balance }: Props) {
  const { t } = useTranslation();
  const anchorRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const open = () => {
    setShowHelp(false);
    anchorRef.current?.measureInWindow((x, y, w, h) => setAnchor({ x, y, width: w, height: h }));
  };

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
              <CoinPurseIcon size={24} color="#E8C36B" />
            </View>
            <View className="flex-1" style={{ minWidth: 0 }}>
              <Text className="text-[10px] font-bold text-white/50 tracking-[2px] uppercase">
                {t('dashboard.walletTitle')}
              </Text>
              <View className="mt-1">
                <CoinAmount atomic={balance} size={15} textColor="#E8C36B" showSigla omitAs />
              </View>
            </View>

            {/* Ajuda: alterna a explicação das moedas */}
            <TouchableOpacity
              onPress={() => setShowHelp((v) => !v)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.walletHelp.title')}
              className="w-6 h-6 rounded-full bg-white/10 items-center justify-center ml-2">
              <Text className="text-[13px] font-extrabold text-white/80">?</Text>
            </TouchableOpacity>
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

          {/* Explicação das moedas + conversões */}
          {showHelp && (
            <View className="border-t border-white/10 mt-3 pt-2.5">
              <Text className="text-[10px] font-bold text-white/50 tracking-[1.5px] uppercase mb-1">
                {t('dashboard.walletHelp.title')}
              </Text>
              <HelpRow
                icon={<AureusCoin size={20} />}
                name={t('coins.aureus')}
                rule={t('dashboard.walletHelp.aureus')}
              />
              <HelpRow
                icon={<DenariusCoin size={20} />}
                name={t('coins.denarius')}
                rule={t('dashboard.walletHelp.denarius')}
              />
              <HelpRow
                icon={<AsCoin size={20} />}
                name={t('coins.as')}
                rule={t('dashboard.walletHelp.as')}
              />
            </View>
          )}
        </View>
      </AnchoredPopover>
    </>
  );
}
