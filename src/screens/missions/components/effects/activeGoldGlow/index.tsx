import React, { useEffect } from 'react';
import Reanimated, {
  Easing as ReEasing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Glow dourado PULSANTE ao redor do card de missões ativas — destaque que chama
// atenção sem travar: roda no UI thread (reanimated), animando só a opacidade de um
// overlay leve (sem SVG e sem medir layout). Assim abrir a aba fica fluido.
// Decorativo (pointerEvents none) e só monta com o card fechado.
export default function ActiveGoldGlow({ radius = 20 }: { radius?: number }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: ReEasing.inOut(ReEasing.ease) }),
      -1, // infinito
      true, // vai-e-volta (respira)
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: 0.3 + pulse.value * 0.7 }));

  return (
    <Reanimated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderWidth: 2,
          borderColor: '#D4AF37',
          borderRadius: radius,
        },
        style,
      ]}
    />
  );
}
