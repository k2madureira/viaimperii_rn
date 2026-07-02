import React from 'react';
import Svg, { Line, Text as SvgText } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Ícone de lista numerada (ordered list) — estilo Lucide monoline.
export default function OrderedListIcon({ size = 24, color = '#121212', strokeWidth = 2 }: Props) {
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
      <Line x1={10} y1={6} x2={21} y2={6} />
      <Line x1={10} y1={12} x2={21} y2={12} />
      <Line x1={10} y1={18} x2={21} y2={18} />
      <SvgText x={3} y={8.5} fontSize={6} fill={color} stroke="none">
        1.
      </SvgText>
      <SvgText x={3} y={14.5} fontSize={6} fill={color} stroke="none">
        2.
      </SvgText>
      <SvgText x={3} y={20.5} fontSize={6} fill={color} stroke="none">
        3.
      </SvgText>
    </Svg>
  );
}
