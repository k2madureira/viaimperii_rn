import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Ícone de "quartel-general" — arquitetura romana reinterpretada como ícone
 * moderno (estilo Lucide): monoline, cantos arredondados, simetria imperial,
 * entrada central em arco. Sem colunas/templos.
 */
export default function HomeIcon({ size = 24, color = '#121212', strokeWidth = 2 }: Props) {
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
      {/* corpo do edifício com cantos superiores arredondados */}
      <Path d="M5 21V8a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13" />
      {/* laje superior e base com leve avanço simétrico */}
      <Path d="M3 7h18" />
      <Path d="M3 21h18" />
      {/* entrada central em arco */}
      <Path d="M10 21v-6a2 2 0 0 1 4 0v6" />
      {/* janelas simétricas */}
      <Path d="M8 11v2" />
      <Path d="M16 11v2" />
    </Svg>
  );
}
