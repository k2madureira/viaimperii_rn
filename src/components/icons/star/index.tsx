import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
  // Preenchida (favoritada) × só contorno (não favoritada).
  filled?: boolean;
  // Cor do preenchimento quando `filled` (default = color).
  fillColor?: string;
}

const STAR_PATH =
  'M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.94L12 2.5z';

// Estrela de favorito das missões — dourada preenchida quando favoritada,
// contorno quando não. Monoline estilo Lucide (§0.1 — SVG, sem emoji).
export default function StarIcon({
  size = 20,
  color = '#D4AF37',
  strokeWidth = 2,
  filled = false,
  fillColor,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={STAR_PATH}
        fill={filled ? (fillColor ?? color) : 'none'}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
