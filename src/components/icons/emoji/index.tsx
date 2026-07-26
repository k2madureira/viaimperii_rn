import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Carinha sorridente (outline) — gatilho do seletor de emojis no composer do chat.
export default function EmojiIcon({ size = 22, color = '#111', strokeWidth = 1.8 }: Props) {
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
      <Circle cx="12" cy="12" r="9" />
      <Path d="M8 14a4.5 4.5 0 0 0 8 0" />
      <Path d="M9 9.5h.01" />
      <Path d="M15 9.5h.01" />
    </Svg>
  );
}
