import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

// Carteira — gatilho que abre o popover de saldo.
export default function WalletIcon({ size = 20, color = '#111' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="6" width="18" height="13" rx="2.4" />
      <Path d="M3 10h18" />
      <Path d="M15 14.2h2.5" />
    </Svg>
  );
}
