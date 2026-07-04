import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Ícone de Perfil — busto de usuário (cabeça + ombros) em monoline,
 * estilo Lucide, consistente com os demais ícones da bottom tab.
 */
export default function ProfileIcon({
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
      {/* cabeça */}
      <Circle cx={12} cy={8} r={4} />
      {/* ombros / busto */}
      <Path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </Svg>
  );
}
