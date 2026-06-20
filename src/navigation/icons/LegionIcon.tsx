import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Ícone de Legião — águia imperial abstrata e geométrica, simétrica, com asas
 * angulares. Estilo logotipo de empresa de tecnologia. Monoline, Lucide-style.
 */
export default function LegionIcon({ size = 24, color = '#121212', strokeWidth = 2 }: Props) {
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
      {/* asas + corpo (silhueta angular fechada) */}
      <Path d="M12 6 L6 8 L9.5 9.5 L5.5 12.5 L12 11.5 L18.5 12.5 L14.5 9.5 L18 8 Z" />
      {/* pescoço */}
      <Path d="M12 6 V4" />
      {/* cabeça / crista */}
      <Path d="M10.9 4.4 L12 3 L13.1 4.4" />
      {/* cauda */}
      <Path d="M10.5 14.5 L12 11.5 L13.5 14.5" />
    </Svg>
  );
}
