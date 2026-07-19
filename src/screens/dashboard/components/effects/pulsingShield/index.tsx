import React, { useEffect } from 'react';
import { View } from 'react-native';
import Reanimated, {
  Easing as ReEasing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { ShieldIcon } from '../../../../../components/icons';

interface Props {
  size: number; // tamanho do escudo (o halo é reservado ao redor)
  fillRatio: number; // 0..1 — preenchimento do escudo (nível de escudos)
  glowColor: string; // cor da aura, definida pela quantidade
  color?: string; // cor do contorno do escudo
}

// Escudo de ofensiva com AURA PULSANTE externa: o halo (radial gradient que esmaece
// até transparente) vive FORA do contorno do escudo, num box maior reservado p/ não
// cortar/empurrar o layout. Anima escala + opacidade em loop (respiração) no UI thread
// (reanimated), cancelando no unmount. A cor vem da quantidade de escudos.
export default function PulsingShield({ size, fillRatio, glowColor, color = '#4a5a8a' }: Props) {
  const pulse = useSharedValue(0);
  const uid = React.useId().replace(/:/g, '');

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1200, easing: ReEasing.inOut(ReEasing.ease) }),
      -1, // infinito
      true, // vai-e-volta (respira)
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  // Box reserva o espaço do halo (aura ~1.8x o escudo) → sem clip nem deslocar vizinhos.
  const halo = Math.round(size * 1.8);

  const auraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.82 + pulse.value * 0.33 }],
    opacity: 0.4 + pulse.value * 0.5,
  }));

  return (
    <View style={{ width: halo, height: halo, alignItems: 'center', justifyContent: 'center' }}>
      {/* Aura externa pulsante (decorativa, atrás do escudo). */}
      <Reanimated.View
        pointerEvents="none"
        style={[{ position: 'absolute', width: halo, height: halo }, auraStyle]}>
        <Svg width={halo} height={halo} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id={`aura-${uid}`} cx={50} cy={50} r={50} gradientUnits="userSpaceOnUse">
              <Stop offset={0.4} stopColor={glowColor} stopOpacity={0.55} />
              <Stop offset={1} stopColor={glowColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={50} cy={50} r={50} fill={`url(#aura-${uid})`} />
        </Svg>
      </Reanimated.View>

      {/* Escudo com preenchimento proporcional (sem glow interno — a aura é externa). */}
      <ShieldIcon size={size} color={color} fillRatio={fillRatio} />
    </View>
  );
}
