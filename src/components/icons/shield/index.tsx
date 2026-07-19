import React from 'react';
import Svg, { Circle, ClipPath, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
  // Preenche o escudo de baixo p/ cima (0..1), mantendo o contorno. Omitido = sem fill.
  fillRatio?: number;
  // Cor do preenchimento (default = color).
  fillColor?: string;
  // Halo/brilho ao redor do escudo. Omitido = sem glow (comportamento original).
  glowColor?: string;
}

const SHIELD_PATH = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z';
// Faixa vertical preenchível do escudo dentro do viewBox 0..24 (topo ~2, base ~22).
const TOP_Y = 2;
const BOTTOM_Y = 22;

// Escudo — base usada no selo de trilha das missões. Com `fillRatio`/`glowColor`
// vira o indicador de escudos de ofensiva (nível de preenchimento + halo por cor).
export default function ShieldIcon({
  size = 16,
  color = '#4a5a8a',
  strokeWidth = 2,
  fillRatio,
  fillColor,
  glowColor,
}: Props) {
  // ID único por instância (evita colisão de <Defs> quando há vários escudos).
  const uid = React.useId().replace(/:/g, '');
  const ratio = fillRatio == null ? 0 : Math.max(0, Math.min(1, fillRatio));
  const hasFill = fillRatio != null && ratio > 0;
  const fillTopY = BOTTOM_Y - (BOTTOM_Y - TOP_Y) * ratio;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        {hasFill && (
          <ClipPath id={`sfill-${uid}`}>
            {/* Recorta só a fração inferior → preenche de baixo p/ cima. */}
            <Rect x={0} y={fillTopY} width={24} height={BOTTOM_Y - fillTopY + 2} />
          </ClipPath>
        )}
        {glowColor ? (
          <RadialGradient id={`sglow-${uid}`} cx={12} cy={12} r={12} gradientUnits="userSpaceOnUse">
            <Stop offset={0.35} stopColor={glowColor} stopOpacity={0.55} />
            <Stop offset={1} stopColor={glowColor} stopOpacity={0} />
          </RadialGradient>
        ) : null}
      </Defs>

      {/* Halo por trás do escudo (aura suave que esmaece nas bordas). */}
      {glowColor ? <Circle cx={12} cy={12} r={12} fill={`url(#sglow-${uid})`} /> : null}

      {/* Preenchimento proporcional recortado. */}
      {hasFill ? (
        <Path d={SHIELD_PATH} fill={fillColor ?? color} clipPath={`url(#sfill-${uid})`} />
      ) : null}

      {/* Contorno do escudo (sempre por cima). */}
      <Path
        d={SHIELD_PATH}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
