import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Ícone de Missões — híbrido de alvo + lâmina romana (gladius estilizada),
 * comunicando objetivos e progressão. Monoline, estilo Lucide.
 */
export default function MissionsIcon({ size = 24, color = '#121212', strokeWidth = 2 }: Props) {
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
      {/* lâmina (folha) apontando para cima */}
      <Path d="M12 2.5 L14.3 7 L12 11.5 L9.7 7 Z" />
      {/* guarda da lâmina */}
      <Path d="M9 11.5 H15" />
      {/* alvo */}
      <Circle cx={12} cy={15.5} r={5} />
      {/* centro do alvo */}
      <Circle cx={12} cy={15.5} r={1.4} />
    </Svg>
  );
}
