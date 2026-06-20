import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function Base({
  size = 24,
  color = '#121212',
  strokeWidth = 2,
  children,
}: IconProps & { children: React.ReactNode }) {
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
      {children}
    </Svg>
  );
}

// Engenharia (Fabrorum) — engrenagem
export function EngineeringIcon(props: IconProps) {
  return (
    <Base {...props}>
      <Circle cx={12} cy={12} r={4} />
      <Circle cx={12} cy={12} r={1.3} />
      <Path d="M12 7V5" />
      <Path d="M12 19v-2" />
      <Path d="M17 12h2" />
      <Path d="M5 12h2" />
      <Path d="M15.5 8.5l1.5-1.5" />
      <Path d="M7 17l1.5-1.5" />
      <Path d="M8.5 8.5L7 7" />
      <Path d="M17 17l-1.5-1.5" />
    </Base>
  );
}

// Estratégia (Strategica) — estandarte / bandeira
export function StrategyIcon(props: IconProps) {
  return (
    <Base {...props}>
      <Path d="M7 21V3" />
      <Path d="M7 4h11l-3 3 3 3H7" />
    </Base>
  );
}

// Comércio (Mercatorum) — moeda romana (denário)
export function CommerceIcon(props: IconProps) {
  return (
    <Base {...props}>
      <Circle cx={12} cy={12} r={8} />
      <Path d="M9.5 9.5l5 5" />
      <Path d="M14.5 9.5l-5 5" />
    </Base>
  );
}

// Diplomacia (Diplomatica) — pergaminho / carta
export function DiplomacyIcon(props: IconProps) {
  return (
    <Base {...props}>
      <Path d="M7 5h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      <Path d="M9.5 9h5" />
      <Path d="M9.5 12h5" />
      <Path d="M9.5 15h3" />
    </Base>
  );
}

// Exploração (Exploratorum) — bússola
export function ExplorationIcon(props: IconProps) {
  return (
    <Base {...props}>
      <Circle cx={12} cy={12} r={8} />
      <Path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </Base>
  );
}

export const MASTERY_ICONS: Record<
  string,
  (props: IconProps) => React.ReactElement
> = {
  Engineering: EngineeringIcon,
  Strategy: StrategyIcon,
  Commerce: CommerceIcon,
  Diplomacy: DiplomacyIcon,
  Exploration: ExplorationIcon,
};
