import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

// Bolsa de moedas — ícone da carteira (saco cinturado com cifrão central).
export default function CoinPurseIcon({ size = 18, color = '#E8C36B' }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round">
      {/* Boca cinturada (topo amarrado) */}
      <Path d="M8 7l1.3-3h5.4L16 7" />
      <Path d="M7.5 7h9" />
      {/* Corpo do saco */}
      <Path d="M8.5 7C6 8.9 4.5 11.6 4.5 14.5A5.5 5.5 0 0 0 10 20h4a5.5 5.5 0 0 0 5.5-5.5c0-2.9-1.5-5.6-4-7.5" />
      {/* Cifrão */}
      <Path d="M12 10.6v6" />
      <Path d="M13.8 12.1c-.4-.6-1-.9-1.8-.9-1.1 0-1.9.6-1.9 1.4 0 1.9 3.7 1 3.7 3 0 .9-.8 1.5-1.9 1.5-.8 0-1.5-.3-1.9-.9" />
    </Svg>
  );
}
