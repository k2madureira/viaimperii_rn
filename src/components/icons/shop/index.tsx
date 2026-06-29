import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

// Sacola de compras — aba "Loja".
export default function ShopIcon({ size = 18, color = '#9E1B32' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 8h12l-0.8 11.5a1 1 0 0 1-1 0.9H7.8a1 1 0 0 1-1-0.9Z" />
      <Path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </Svg>
  );
}
