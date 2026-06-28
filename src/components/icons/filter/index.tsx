import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Ícone de funil de filtro (estilo outline, consistente com os demais ícones do app).
export default function FilterIcon({ size = 18, color = '#121212', strokeWidth = 2 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z" />
    </Svg>
  );
}
