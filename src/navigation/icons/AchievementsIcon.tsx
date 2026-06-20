import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Ícone de Conquistas — medalha/insígnia envolta por uma coroa de louros sutil,
 * comunicando realização e maestria. Monoline, estilo Lucide.
 */
export default function AchievementsIcon({
  size = 24,
  color = '#121212',
  strokeWidth = 2,
}: Props) {
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
      {/* insígnia */}
      <Circle cx={12} cy={11} r={4} />
      {/* check central */}
      <Path d="M10.3 11 L11.4 12.1 L13.7 9.5" />
      {/* louros (arcos laterais) */}
      <Path d="M8 5.8 C4 7.8, 4 14.2, 8 16.5" />
      <Path d="M16 5.8 C20 7.8, 20 14.2, 16 16.5" />
      {/* folhas sutis */}
      <Path d="M4.7 9.4 l-1.7 -0.5" />
      <Path d="M4.5 13.4 l-1.7 0.5" />
      <Path d="M19.3 9.4 l1.7 -0.5" />
      <Path d="M19.5 13.4 l1.7 0.5" />
    </Svg>
  );
}
