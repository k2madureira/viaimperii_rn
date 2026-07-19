import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ProductType } from '../../../../api/physical/physicalApi';

// Paleta imperial romana — variações que combinam com o tema (não monocromático).
export const MARKET_COLORS = {
  red: '#9E1B32', // Imperial Red
  gold: '#B28F1E', // Imperial Gold (accent-600, legível no branco)
  laurel: '#2F7A52', // Verde-louro
  purple: '#6E3FA3', // Púrpura de Tiro
  bronze: '#A0642E', // Bronze
  slate: '#5B6B7A', // Ardósia (neutro)
} as const;

export type MarketSection = 'professions' | 'products' | 'campaigns';

// Cor-tema de cada seção do mercado.
export const SECTION_COLOR: Record<MarketSection, string> = {
  professions: MARKET_COLORS.gold,
  products: MARKET_COLORS.laurel,
  campaigns: MARKET_COLORS.red,
};

// Cor-tema de cada tipo de produto físico (+ "all").
export const TYPE_COLOR: Record<ProductType | 'all', string> = {
  all: MARKET_COLORS.slate,
  apparel: MARKET_COLORS.red,
  drinkware: MARKET_COLORS.laurel,
  accessory: MARKET_COLORS.purple,
  collectible: MARKET_COLORS.gold,
  other: MARKET_COLORS.bronze,
};

const stroke = (color: string) => ({
  stroke: color,
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
});

// Ícone de cada seção do mercado.
export function MarketSectionIcon({
  section,
  size = 18,
  color = '#9E1B32',
}: {
  section: MarketSection;
  size?: number;
  color?: string;
}) {
  const s = stroke(color);
  const svg = { width: size, height: size, viewBox: '0 0 24 24' };

  switch (section) {
    case 'professions': // livro aberto (estudo/missões de profissão)
      return (
        <Svg {...svg}>
          <Path d="M12 6.5S10 5 7 5 3 6 3 6v11s2-1 4-1 5 1.5 5 1.5" {...s} />
          <Path d="M12 6.5S14 5 17 5s4 1 4 1v11s-2-1-4-1-5 1.5-5 1.5" {...s} />
        </Svg>
      );
    case 'products': // sacola de compras
      return (
        <Svg {...svg}>
          <Path d="M6 8h12l-0.8 11.5a1 1 0 0 1-1 0.9H7.8a1 1 0 0 1-1-0.9Z" {...s} />
          <Path d="M9 8V6.5a3 3 0 0 1 6 0V8" {...s} />
        </Svg>
      );
    case 'campaigns': // estandarte/vexillum
      return (
        <Svg {...svg}>
          <Path d="M5 3v18" {...s} />
          <Path d="M5 4h12l-2.5 3.5L17 11H5" {...s} />
        </Svg>
      );
  }
}
