import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
}

/**
 * Ícone de presente colorido (multi-fill) — gatilho da tela de Prêmios na Home.
 * Não segue tint monocromático de propósito (é um destaque festivo).
 */
export default function GiftIcon({ size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Corpo da caixa */}
      <Rect x={4.5} y={10.5} width={15} height={9.5} rx={1.4} fill="#9E1B32" />
      {/* Tampa */}
      <Rect x={3} y={7} width={18} height={3.8} rx={1.2} fill="#C0392B" />
      {/* Fita vertical */}
      <Rect x={10.4} y={7} width={3.2} height={13} fill="#F1C40F" />
      {/* Laço (duas voltas) */}
      <Path d="M12 7.2C12 5.1 10.4 4 8.8 4.6 7.3 5.2 7.9 7.2 12 7.2Z" fill="#F5B301" />
      <Path d="M12 7.2C12 5.1 13.6 4 15.2 4.6 16.7 5.2 16.1 7.2 12 7.2Z" fill="#F5B301" />
      {/* Nó central */}
      <Rect x={10.5} y={5.8} width={3} height={2.6} rx={1.1} fill="#E8A200" />
    </Svg>
  );
}
