import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  specialty: string;
  size?: number;
  color?: string;
}

/**
 * Ícones representativos de cada maestria/especialidade.
 * Engineering → engrenagem · Strategy → estandarte · Commerce → moeda
 * Diplomacy → tratado · Exploration → bússola
 */
export default function SpecialtyIcon({ specialty, size = 16, color = '#8B1A2B' }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
  };
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (specialty) {
    case 'Engineering':
      return (
        <Svg {...common}>
          <Circle cx={12} cy={12} r={3} {...stroke} />
          <Path
            d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            {...stroke}
          />
        </Svg>
      );

    case 'Strategy':
      return (
        <Svg {...common}>
          <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" {...stroke} />
          <Path d="M4 22v-7" {...stroke} />
        </Svg>
      );

    case 'Commerce':
      return (
        <Svg {...common}>
          <Circle cx={12} cy={12} r={9} {...stroke} />
          <Path d="M14.5 9.3a2 2 0 0 0-2.5-.8c-1.2.4-1.4 1.9-.2 2.4l1.6.7c1.2.5 1 2-.2 2.4a2 2 0 0 1-2.5-.8" {...stroke} />
          <Path d="M12 7v1 M12 16v1" {...stroke} />
        </Svg>
      );

    case 'Diplomacy':
      return (
        <Svg {...common}>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...stroke} />
          <Path d="M14 2v6h6" {...stroke} />
          <Path d="M16 13H8 M16 17H8 M10 9H8" {...stroke} />
        </Svg>
      );

    case 'Exploration':
      return (
        <Svg {...common}>
          <Circle cx={12} cy={12} r={10} {...stroke} />
          <Path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" {...stroke} />
        </Svg>
      );

    default:
      return null;
  }
}
