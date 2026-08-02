import React from 'react';
import { Image, View } from 'react-native';
import Text from '../../text';
import { CoinDenom, coinParts } from '../../../utils/coins';

interface CoinProps {
  size?: number;
}

// Arte das moedas (PNG) por denominação — bustos imperiais em ouro/prata/bronze.
const COIN_SOURCE: Record<CoinDenom, number> = {
  aureus: require('../../../../assets/coins/aureus.png'),
  denarius: require('../../../../assets/coins/denarius.png'),
  as: require('../../../../assets/coins/as.png'),
};

// Renderiza a arte da moeda em um quadrado `size`.
function CoinImage({ denom, size = 18 }: CoinProps & { denom: CoinDenom }) {
  return (
    <Image
      source={COIN_SOURCE[denom]}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}

// Aureus — ouro.
export function AureusCoin({ size = 18 }: CoinProps) {
  return <CoinImage denom="aureus" size={size} />;
}

// Denarius — prata.
export function DenariusCoin({ size = 18 }: CoinProps) {
  return <CoinImage denom="denarius" size={size} />;
}

// As — bronze.
export function AsCoin({ size = 18 }: CoinProps) {
  return <CoinImage denom="as" size={size} />;
}

export function CoinIcon({ denom, size = 18 }: CoinProps & { denom: CoinDenom }) {
  if (denom === 'aureus') return <AureusCoin size={size} />;
  if (denom === 'denarius') return <DenariusCoin size={size} />;
  return <AsCoin size={size} />;
}

// Sigla curta por denominação, usada ao lado do valor (ex.: carteira da home).
const COIN_SIGLA: Record<CoinDenom, string> = { aureus: 'AU', denarius: 'DN', as: 'AS' };

// Mostra um valor atômico como moedas (ícone + contagem) por denominação.
export function CoinAmount({
  atomic,
  size = 16,
  textColor = '#3d2900',
  compact = false,
  showSigla = false,
  omitAs = false,
  wrap = true,
}: {
  atomic: number;
  size?: number;
  textColor?: string;
  compact?: boolean;
  showSigla?: boolean;
  omitAs?: boolean; // esconde a denominação `as` (ex.: carteira, que tem linha própria)
  wrap?: boolean; // false = uma linha só (ex.: pill compacto que não pode quebrar)
}) {
  let parts = compact ? coinParts(atomic).slice(0, 1) : coinParts(atomic);
  if (omitAs) parts = parts.filter((p) => p.name !== 'as');
  return (
    // flexWrap evita estouro horizontal quando o container tem largura limitada
    // (ex.: popover da carteira com 3 denominações + sigla). Em pills compactos
    // (largura livre), `wrap={false}` mantém as moedas numa única linha.
    <View className="flex-row items-center" style={{ gap: 7, flexWrap: wrap ? 'wrap' : 'nowrap' }}>
      {parts.map((p) => (
        <View key={p.name} className="flex-row items-center" style={{ gap: 3 }}>
          <CoinIcon denom={p.name} size={size} />
          <Text style={{ color: textColor, fontWeight: '800', fontSize: Math.round(size * 0.82) }}>
            {p.count}
            {showSigla ? ` ${COIN_SIGLA[p.name]}` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}
