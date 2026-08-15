import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

// Grupo de usuários (amigos) — duas pessoas.
export default function UsersIcon({ size = 20, color = '#888' }: Props) {
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
      {/* Pessoa de trás */}
      <Path d="M16 20v-1a4 4 0 0 0-3-3.87" />
      <Path d="M13 4.2a4 4 0 0 1 0 7.75" />
      {/* Pessoa da frente */}
      <Circle cx={9} cy={7.5} r={3.2} />
      <Path d="M3 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
    </Svg>
  );
}
