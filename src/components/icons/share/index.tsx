import React from 'react';
import Svg, { Line, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Avião de papel (send) apontando para o canto superior direito — ícone de
// compartilhar no estilo Instagram.
export default function ShareIcon({ size = 22, color = '#111', strokeWidth = 1.8 }: Props) {
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
      <Line x1="22" y1="2" x2="11" y2="13" />
      <Path d="M22 2 15 22 11 13 2 9 22 2 Z" />
    </Svg>
  );
}
