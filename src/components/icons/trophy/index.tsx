import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Ícone de Troféu — aba do Placar da Semana (leaderboards). Monoline, estilo
 * Lucide, para seguir o esquema de cor da tab bar (cinza inativo / vermelho ativo).
 */
export default function TrophyIcon({ size = 24, color = '#121212', strokeWidth = 2 }: Props) {
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
      {/* alças laterais */}
      <Path d="M6 4 H18 V9 a6 6 0 0 1 -12 0 Z" />
      <Path d="M6 6 H4 a2 2 0 0 0 -2 2 a3 3 0 0 0 3 3 h1" />
      <Path d="M18 6 h2 a2 2 0 0 1 2 2 a3 3 0 0 1 -3 3 h-1" />
      {/* haste + base */}
      <Path d="M12 15 v3" />
      <Path d="M9 21 h6" />
      <Path d="M9.5 18 h5 l0.5 3 h-6 Z" />
    </Svg>
  );
}
