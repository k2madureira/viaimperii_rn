import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';
import { CoinDenom, coinParts } from '../../../utils/coins';

interface CoinProps {
  size?: number;
}

// Caminho de uma estrela de 5 pontas centrada (emblema da moeda).
function starPath(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

const STAR = starPath(12, 12, 3.4, 1.45);

// Pérolas em volta da borda (aureus): pequenos círculos no perímetro.
function pearls(radius: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const a = (2 * Math.PI * i) / count - Math.PI / 2;
    return { cx: 12 + radius * Math.cos(a), cy: 12 + radius * Math.sin(a) };
  });
}

// Núcleo metálico reutilizável (gradiente radial + disco + estrela).
function MetalCoin({
  size = 18,
  gid,
  rim,
  light,
  mid,
  dark,
  emblem,
  variant,
}: CoinProps & {
  gid: string;
  rim: string;
  light: string;
  mid: string;
  dark: string;
  emblem: string;
  variant: 'pearled' | 'beaded' | 'plain';
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id={gid} cx="42%" cy="38%" r="65%">
          <Stop offset="0%" stopColor={light} />
          <Stop offset="55%" stopColor={mid} />
          <Stop offset="100%" stopColor={dark} />
        </RadialGradient>
      </Defs>

      {/* Disco principal */}
      <Circle cx={12} cy={12} r={11} fill={`url(#${gid})`} stroke={rim} strokeWidth={1} />

      {/* Borda: pérolas (aureus) ou contas (denarius); plain = só anel */}
      {variant === 'pearled' &&
        pearls(9.6, 18).map((p, i) => (
          <Circle key={i} cx={p.cx} cy={p.cy} r={0.85} fill={light} opacity={0.95} />
        ))}
      {variant === 'beaded' &&
        pearls(9.5, 22).map((p, i) => (
          <Circle key={i} cx={p.cx} cy={p.cy} r={0.55} fill={dark} opacity={0.7} />
        ))}

      {/* Anel interno + brilho */}
      <Circle cx={12} cy={12} r={7.4} fill="none" stroke={rim} strokeWidth={0.7} opacity={0.55} />
      <Circle cx={9} cy={8.6} r={3} fill={light} opacity={0.28} />

      {/* Emblema central */}
      <G>
        <Path d={STAR} fill={emblem} opacity={0.9} />
      </G>
    </Svg>
  );
}

let _seq = 0;
function useGid(prefix: string) {
  return React.useMemo(() => `${prefix}-${(_seq += 1)}`, [prefix]);
}

// Aureus — ouro com borda perolada.
export function AureusCoin({ size = 18 }: CoinProps) {
  const gid = useGid('aureus');
  return (
    <MetalCoin
      size={size}
      gid={gid}
      variant="pearled"
      light="#FFF4C2"
      mid="#F2C14E"
      dark="#B9821C"
      rim="#8A5E12"
      emblem="#7A5310"
    />
  );
}

// Denarius — prata com borda em contas.
export function DenariusCoin({ size = 18 }: CoinProps) {
  const gid = useGid('denarius');
  return (
    <MetalCoin
      size={size}
      gid={gid}
      variant="beaded"
      light="#FBFBFD"
      mid="#C8CCD2"
      dark="#8A9099"
      rim="#6B7077"
      emblem="#5A6068"
    />
  );
}

// As — bronze, borda lisa.
export function AsCoin({ size = 18 }: CoinProps) {
  const gid = useGid('as');
  return (
    <MetalCoin
      size={size}
      gid={gid}
      variant="plain"
      light="#E7B98A"
      mid="#C07C3F"
      dark="#864F1E"
      rim="#5E3713"
      emblem="#4F2F11"
    />
  );
}

export function CoinIcon({ denom, size = 18 }: CoinProps & { denom: CoinDenom }) {
  if (denom === 'aureus') return <AureusCoin size={size} />;
  if (denom === 'denarius') return <DenariusCoin size={size} />;
  return <AsCoin size={size} />;
}

// Sigla curta por denominação, usada ao lado do valor (ex.: carteira da home).
const COIN_SIGLA: Record<CoinDenom, string> = { aureus: 'AU', denarius: 'DN', as: 'AS' };

// Mostra um valor atômico como moedas (ícone + contagem) por denominação.
export function CoinAmount({
  atomic,
  size = 16,
  textColor = '#3d2900',
  compact = false,
  showSigla = false,
}: {
  atomic: number;
  size?: number;
  textColor?: string;
  compact?: boolean;
  showSigla?: boolean;
}) {
  const parts = compact ? coinParts(atomic).slice(0, 1) : coinParts(atomic);
  return (
    <View className="flex-row items-center" style={{ gap: 7 }}>
      {parts.map((p) => (
        <View key={p.name} className="flex-row items-center" style={{ gap: 3 }}>
          <CoinIcon denom={p.name} size={size} />
          <Text style={{ color: textColor, fontWeight: '800', fontSize: Math.round(size * 0.82) }}>
            {p.count}
            {showSigla ? ` ${COIN_SIGLA[p.name]}` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}
