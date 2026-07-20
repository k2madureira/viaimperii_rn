import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { ReactionType } from '../../../api/feed';

interface IconProps {
  size?: number;
}

// Ícones de reação em SVG (render uniforme entre dispositivos — evita variação
// de largura/tofu dos emojis, que cortava a última reação em telas menores).

// 👍 Curtir — polegar para cima, dourado (identidade atual do "like").
export function LikeReactionIcon({ size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 10.5h2.4V20H4a1 1 0 0 1-1-1v-8.5z" fill="#D99A00" />
      <Path
        d="M5.4 10.4 9.8 3.2a1.4 1.4 0 0 1 2.6 1v4.1h4.7a2 2 0 0 1 1.96 2.4l-1.25 6.2A2 2 0 0 1 15.8 20H5.4V10.4z"
        fill="#F5B301"
      />
    </Svg>
  );
}

// 👏 Palmas — duas mãos + traços de movimento.
export function ClapReactionIcon({ size = 22 }: IconProps) {
  const hand =
    'M0 4.3a1.1 1.1 0 0 1 2.2 0V8h.5V2.7a1.1 1.1 0 0 1 2.2 0V8h.5V3.7a1.1 1.1 0 0 1 2.2 0V11c0 2.5-1.8 4.5-4.2 4.5-1.4 0-2.7-.7-3.5-2l-1.3-2.2a1.1 1.1 0 0 1 1.85-1.2l.7.9V4.3z';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* traços de movimento */}
      <Path
        d="M12 2v2.2M8 2.9l.9 2M16 2.9l-.9 2"
        stroke="#F0A62A"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* mão de trás */}
      <G transform="translate(2.6 5.2) rotate(-16)">
        <Path d={hand} fill="#E79A2E" />
      </G>
      {/* mão da frente (espelhada) */}
      <G transform="translate(21.4 5.2) scale(-1 1) rotate(-16)">
        <Path d={hand} fill="#F7BE55" />
      </G>
    </Svg>
  );
}

// 🔥 Fogo — chama laranja com miolo dourado.
export function FireReactionIcon({ size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.2c2.4 2.9 3.6 5 3.6 7.2 0 1-.3 1.9-.8 2.7.9-.2 1.7-.9 2.2-2 .5 1.2.8 2.4.8 3.5A5.8 5.8 0 1 1 6.4 13c0-1.6.7-3 1.8-4.2.2 1.2 1 2 2 2.2C9.7 7.4 10.6 4.2 12 2.2z"
        fill="#FF6A1A"
      />
      <Path
        d="M12 21.2a3.6 3.6 0 0 0 3.6-3.6c0-1.6-1-2.7-1.7-3.9-.6 1-1.4 1.5-2.4 1.6.3-1.8-.9-3.2-.9-3.2S9 11.4 9 13.7a3.4 3.4 0 0 0 3 7.5z"
        fill="#FFC02E"
      />
    </Svg>
  );
}

// 🫡 Continência — rosto com a mão na testa (saudação).
export function SaluteReactionIcon({ size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12.6" r="9" fill="#FBC02D" />
      <Circle cx="9.2" cy="12.8" r="1.1" fill="#6B4E1E" />
      <Circle cx="15" cy="12.8" r="1.1" fill="#6B4E1E" />
      <Path
        d="M9 16.2c1.2 1.1 4 1.1 5.2 0"
        stroke="#6B4E1E"
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
      {/* mão em continência: barra inclinada sobre a testa */}
      <Path
        d="M4.5 10.3 18.7 7.5a1.35 1.35 0 0 1 .5 2.65L6.1 12.85a1.35 1.35 0 0 1-1.6-2.55z"
        fill="#E7A33E"
      />
    </Svg>
  );
}

const ICONS: Record<ReactionType, (p: IconProps) => React.ReactElement> = {
  like: LikeReactionIcon,
  clap: ClapReactionIcon,
  fire: FireReactionIcon,
  salute: SaluteReactionIcon,
};

// Dispatcher por tipo de reação.
export function ReactionIcon({ type, size = 22 }: { type: ReactionType; size?: number }) {
  const Icon = ICONS[type] ?? LikeReactionIcon;
  return <Icon size={size} />;
}
