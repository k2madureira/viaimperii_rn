import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  accentColor?: string;
}

// Estandarte (vexillum) — haste com águia no topo e o pano quadrado da legião.
export default function StandardIcon({
  size = 20,
  color = '#7a1a2b',
  accentColor = '#C9A227',
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Haste */}
      <Path d="M12 4.6V22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      {/* Águia no topo (esfera + asas estilizadas) */}
      <Circle cx={12} cy={3} r={1.6} fill={accentColor} />
      <Path
        d="M8.6 4.2c1.2-.9 2.3-1.2 3.4-1.2s2.2.3 3.4 1.2"
        stroke={accentColor}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Travessa que sustenta o pano */}
      <Path d="M6.5 7h11" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      {/* Pano do vexillum */}
      <Rect x={7} y={7} width={10} height={8} rx={0.8} fill={color} opacity={0.85} />
      {/* Coroa de louros / marca central no pano */}
      <Circle cx={12} cy={11} r={2} stroke={accentColor} strokeWidth={1.3} fill="none" />
      {/* Franjas inferiores */}
      <Path
        d="M8.4 15v1.4M10.8 15v1.4M13.2 15v1.4M15.6 15v1.4"
        stroke={accentColor}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
