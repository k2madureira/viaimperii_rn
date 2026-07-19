import React from 'react';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';

// Medalha de pódio (1º ouro, 2º prata, 3º bronze) — fitas + disco com o número.
// Usada nos 3 primeiros lugares do placar semanal.
interface Props {
  place: 1 | 2 | 3;
  size?: number;
}

const PALETTE: Record<1 | 2 | 3, { light: string; mid: string; dark: string; rim: string }> = {
  1: { light: '#FFF4C2', mid: '#F2C14E', dark: '#B9821C', rim: '#8A5E12' },
  2: { light: '#FBFBFD', mid: '#C8CCD2', dark: '#8A9099', rim: '#6B7077' },
  3: { light: '#E7B98A', mid: '#C07C3F', dark: '#864F1E', rim: '#5E3713' },
};

export default function MedalIcon({ place, size = 22 }: Props) {
  const c = PALETTE[place];
  const gid = `medal-${place}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id={gid} cx="42%" cy="38%" r="65%">
          <Stop offset="0%" stopColor={c.light} />
          <Stop offset="55%" stopColor={c.mid} />
          <Stop offset="100%" stopColor={c.dark} />
        </RadialGradient>
      </Defs>
      {/* Fitas */}
      <Path
        d="M8.5 1.5l2.5 6M15.5 1.5l-2.5 6"
        stroke={c.dark}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      {/* Disco */}
      <Circle cx={12} cy={14.5} r={7.2} fill={`url(#${gid})`} stroke={c.rim} strokeWidth={1} />
      <Circle cx={12} cy={14.5} r={5} fill="none" stroke={c.rim} strokeWidth={0.7} opacity={0.5} />
      {/* Número */}
      <G>
        <SvgText
          x={12}
          y={17.8}
          fontSize={7}
          fontWeight="bold"
          fill={c.rim}
          textAnchor="middle">
          {place}
        </SvgText>
      </G>
    </Svg>
  );
}
