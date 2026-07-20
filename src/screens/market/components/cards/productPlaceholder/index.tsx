import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { ProductType } from '../../../../../api/physical';

interface Props {
  type: ProductType;
  size?: number;
  color?: string;
}

const stroke = (color: string) => ({
  stroke: color,
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
});

/**
 * Placeholder SVG por tipo de produto. Renderizado enquanto o produto não tem
 * `image_url` — será substituído pela imagem real quando o backend a fornecer.
 */
export default function ProductPlaceholder({ type, size = 56, color = '#9E1B32' }: Props) {
  const s = stroke(color);
  const svg = { width: size, height: size, viewBox: '0 0 24 24' };

  switch (type) {
    case 'apparel': // camiseta
      return (
        <Svg {...svg}>
          <Path d="M8 3 4 6l2 3 2-1v10h8V8l2 1 2-3-4-3-2 2a3 3 0 0 1-4 0Z" {...s} />
        </Svg>
      );
    case 'drinkware': // caneca
      return (
        <Svg {...svg}>
          <Path d="M5 7h11v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z" {...s} />
          <Path d="M16 9h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2" {...s} />
        </Svg>
      );
    case 'accessory': // pin / etiqueta
      return (
        <Svg {...svg}>
          <Path d="M20 11 13 4a2 2 0 0 0-1.4-.6H5a1 1 0 0 0-1 1v6.6A2 2 0 0 0 4.6 13l7 7a2 2 0 0 0 2.8 0l5.6-5.6a2 2 0 0 0 0-2.8Z" {...s} />
          <Circle cx={8.5} cy={8.5} r={1.4} {...s} />
        </Svg>
      );
    case 'collectible': // medalha / moeda
      return (
        <Svg {...svg}>
          <Circle cx={12} cy={9} r={6} {...s} />
          <Path d="M9 14.5 7 21l5-3 5 3-2-6.5" {...s} />
          <Circle cx={12} cy={9} r={2.5} {...s} />
        </Svg>
      );
    default: // other — caixa/pacote
      return (
        <Svg {...svg}>
          <Path d="M21 8 12 3 3 8l9 5 9-5Z" {...s} />
          <Path d="M3 8v8l9 5 9-5V8" {...s} />
          <Path d="M12 13v8" {...s} />
        </Svg>
      );
  }
}
