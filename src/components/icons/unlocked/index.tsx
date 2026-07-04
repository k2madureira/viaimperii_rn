import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

// Cadeado aberto — aba "Habilitados" (avatares desbloqueados/possuídos).
export default function UnlockedIcon({ size = 18, color = '#9E1B32' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={5} y={11} width={14} height={9.5} rx={2.2} />
      <Path d="M8.5 11V7.6A3.6 3.6 0 0 1 15.5 6.6" />
      <Circle cx={12} cy={15} r={1.4} />
      <Path d="M12 16.4v1.4" />
    </Svg>
  );
}
