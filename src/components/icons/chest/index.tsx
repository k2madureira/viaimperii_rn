import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  // Baú aberto (tampa levantada) × fechado.
  open?: boolean;
}

// Baú de riquezas (§35) — monoline estilo Lucide (§0.1 — SVG, sem emoji).
export default function ChestIcon({ size = 24, color = '#8B1A2B', open = false }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* corpo */}
      <Rect x="3" y="10" width="18" height="10" rx="1.5" stroke={color} strokeWidth={2} />
      {/* tampa */}
      <Path
        d={open ? 'M3 10V8a3 3 0 013-3h12a3 3 0 013 3' : 'M3 10V9a3 3 0 013-3h12a3 3 0 013 3v1'}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* fechadura */}
      <Path d="M12 13v2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Rect x="10.5" y="12" width="3" height="3" rx="0.6" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}
