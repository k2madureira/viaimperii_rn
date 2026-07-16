import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SPARKLE_PATH, SPARKLES, SparkleSpec } from '../../../../../constants/missions';

// Uma estrela que pisca em loop: aparece (fade+scale+giro) e some, com atraso próprio.
function Sparkle({ left, top, size, color, delay, duration }: SparkleSpec) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(2000),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [v, delay, duration]);

  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left, top, opacity: v, transform: [{ scale }, { rotate }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={SPARKLE_PATH} fill={color} />
      </Svg>
    </Animated.View>
  );
}

export default function SparkleOverlay({ radius = 16 }: { radius?: number }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: radius }}>
      {SPARKLES.map((s, i) => (
        <Sparkle key={i} {...s} />
      ))}
    </View>
  );
}
