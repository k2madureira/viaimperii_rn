import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  accentColor?: string;
}

// Cofre da Legião — arca romana com tampa abaulada, cinta metálica e fechadura.
export default function TreasuryIcon({
  size = 20,
  color = '#7a1a2b',
  accentColor = '#C9A227',
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Tampa abaulada */}
      <Path
        d="M3 10.5V9a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v1.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      {/* Corpo da arca */}
      <Rect
        x={2.5}
        y={10.5}
        width={19}
        height={9}
        rx={1.6}
        stroke={color}
        strokeWidth={1.8}
        fill="none"
      />
      {/* Cinta metálica vertical */}
      <Rect x={10.4} y={4} width={3.2} height={15.5} fill={accentColor} opacity={0.9} />
      {/* Linha da tampa */}
      <Path d="M2.5 10.5h19" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      {/* Fechadura */}
      <Circle cx={12} cy={13.4} r={1.5} fill={color} />
      <Path d="M12 14.4v1.8" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}
