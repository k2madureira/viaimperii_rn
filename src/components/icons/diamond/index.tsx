import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

// Diamante — usado na carteira no lugar do ícone de moeda.
export default function DiamondIcon({ size = 18, color = '#5EC9E8' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 9h16" />
      <Path d="M8 4h8l4 5-9.5 11L3 9Z" />
      <Path d="M9 4 6.5 9 12 20l5.5-11L15 4" />
    </Svg>
  );
}
