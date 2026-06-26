import React from 'react';
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Circle,
  Rect,
  Stop,
} from 'react-native-svg';

interface Props {
  size?: number;
}

const CX = 32;
const CY = 31;
const R = 23; // raio onde a coroa de louros é desenhada

// Ângulos (math: 0=direita, 90=topo) cobrindo os dois lados da coroa,
// deixando uma abertura no topo (entre 70° e 110°). As folhas se encontram
// embaixo, atrás da fita.
const LEFT = [110, 130, 150, 170, 190, 210, 230, 250, 268];
const RIGHT = [70, 50, 30, 10, -10, -30, -50, -70, -88];

function leaf(angleDeg: number, key: string) {
  const rad = (angleDeg * Math.PI) / 180;
  const x = CX + R * Math.cos(rad);
  const y = CY - R * Math.sin(rad);
  // Alinha o eixo maior (vertical) da folha à direção radial (aponta para fora).
  const rotation = 90 - angleDeg;
  return (
    <G key={key} transform={`rotate(${rotation}, ${x}, ${y})`}>
      <Ellipse cx={x} cy={y} rx={2.4} ry={5.4} fill="url(#pp-gold)" />
      <Ellipse cx={x} cy={y} rx={0.9} ry={4} fill="#F4D77A" opacity={0.65} />
    </G>
  );
}

/**
 * Emblema do rank Primus Pilus I — coroa de louros dourada, anel de aço,
 * escudo vermelho com cruz prateada e fita inferior. Reconstruído em vetor
 * (react-native-svg) a partir da arte oficial da patente.
 */
export default function PrimusPilusEmblem({ size = 40 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <LinearGradient id="pp-gold" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F6D778" />
          <Stop offset="0.5" stopColor="#D4AF37" />
          <Stop offset="1" stopColor="#9A7B1F" />
        </LinearGradient>
        <LinearGradient id="pp-steel" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#EEF1F4" />
          <Stop offset="0.5" stopColor="#B9C0C8" />
          <Stop offset="1" stopColor="#7E868F" />
        </LinearGradient>
        <LinearGradient id="pp-red" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#C42B40" />
          <Stop offset="1" stopColor="#8B1A2B" />
        </LinearGradient>
      </Defs>

      {/* Coroa de louros */}
      {LEFT.map((a, i) => leaf(a, `l${i}`))}
      {RIGHT.map((a, i) => leaf(a, `r${i}`))}

      {/* Anel de aço atrás do escudo */}
      <Circle cx={CX} cy={CY} r={15.5} fill="url(#pp-steel)" stroke="#6B737C" strokeWidth={1} />
      <Circle cx={CX} cy={CY} r={11.5} fill="#fafafa" opacity={0.25} />

      {/* Escudo vermelho com cruz prateada */}
      <Path
        d="M32 19 L43 23 V31 C43 38 38 42.5 32 45 C26 42.5 21 38 21 31 V23 Z"
        fill="url(#pp-red)"
        stroke="#E7C56A"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {/* Divisor em cruz (prata) */}
      <Rect x={30.7} y={19} width={2.6} height={26} fill="#D9DEE4" opacity={0.95} />
      <Rect x={21} y={29.7} width={22} height={2.6} fill="#D9DEE4" opacity={0.95} />
      {/* Brilho */}
      <Path d="M32 20.5 L41.5 24 V26 L32 22.5 Z" fill="#fff" opacity={0.18} />

      {/* Fita inferior */}
      <Path
        d="M22 46 L32 50 L42 46 L40 53 L32 50 L24 53 Z"
        fill="url(#pp-red)"
        stroke="#E7C56A"
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
