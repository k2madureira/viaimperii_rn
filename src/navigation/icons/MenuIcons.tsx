import React from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const });
const s = (color: string) => ({
  stroke: color,
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function HamburgerIcon({ size = 24, color = '#111' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Line x1={3} y1={6} x2={21} y2={6} {...s(color)} />
      <Line x1={3} y1={12} x2={21} y2={12} {...s(color)} />
      <Line x1={3} y1={18} x2={15} y2={18} {...s(color)} />
    </Svg>
  );
}

export function UserIcon({ size = 22, color = '#8B1A2B' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
        fill={color}
      />
      <Path
        d="M12 14C6.47715 14 2 17.134 2 21V22H22V21C22 17.134 17.5228 14 12 14Z"
        fill={color}
      />
    </Svg>
  );
}

export function CloseIcon({ size = 22, color = '#111' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Line x1={6} y1={6} x2={18} y2={18} {...s(color)} />
      <Line x1={18} y1={6} x2={6} y2={18} {...s(color)} />
    </Svg>
  );
}

export function HomeIcon({ size = 22, color = '#111' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M3 10.5L12 3l9 7.5" {...s(color)} />
      <Path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" {...s(color)} />
      <Path d="M9 21v-6h6v6" {...s(color)} />
    </Svg>
  );
}

export function MissionsIcon({ size = 22, color = '#111' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M9 11l3 3L22 4" {...s(color)} />
      <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" {...s(color)} />
    </Svg>
  );
}

export function CampaignsIcon({ size = 22, color = '#111' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" {...s(color)} />
      <Line x1={4} y1={22} x2={4} y2={15} {...s(color)} />
    </Svg>
  );
}

export function RankingIcon({ size = 22, color = '#111' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Polyline points="3 17 9 11 13 15 21 7" {...s(color)} />
      <Polyline points="15 7 21 7 21 13" {...s(color)} />
    </Svg>
  );
}

export function LegionIcon({ size = 22, color = '#111' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...s(color)} />
      <Path d="M9 12l2 2 4-4" {...s(color)} />
    </Svg>
  );
}

export function RanksIcon({ size = 22, color = '#111' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={12} cy={8} r={5} {...s(color)} />
      <Polyline points="8.5 12.5 7 22 12 19 17 22 15.5 12.5" {...s(color)} />
    </Svg>
  );
}

export function KeyIcon({ size = 20, color = '#111' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx={7.5} cy={15.5} r={4.5} {...s(color)} />
      <Path d="M10.7 12.3 21 2" {...s(color)} />
      <Path d="M16 7l3 3" {...s(color)} />
      <Path d="M18.5 4.5l3 3" {...s(color)} />
    </Svg>
  );
}

export function LogoutIcon({ size = 20, color = '#ef4444' }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...s(color)} />
      <Polyline points="16 17 21 12 16 7" {...s(color)} />
      <Line x1={21} y1={12} x2={9} y2={12} {...s(color)} />
    </Svg>
  );
}
