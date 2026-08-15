import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

// Bandeira (estandarte do clã) — haste com pano tremulando.
export default function FlagIcon({ size = 20, color = '#888' }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round">
      {/* Haste */}
      <Path d="M6 21V3.5" />
      {/* Pano tremulando */}
      <Path d="M6 4c3-1.6 6 1.4 9 0 .9-.4 1.7-.7 2.5-.8v9c-.8.1-1.6.4-2.5.8-3 1.4-6-1.6-9 0" />
    </Svg>
  );
}
