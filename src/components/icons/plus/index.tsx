import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Cruz simples (+) — usado no botão de criar post (FAB da bottom tab bar).
export default function PlusIcon({ size = 22, color = '#fff', strokeWidth = 2.4 }: Props) {
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
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}
