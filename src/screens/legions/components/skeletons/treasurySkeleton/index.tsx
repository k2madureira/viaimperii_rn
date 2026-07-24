import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

// Esqueleto pulsante do bloco do Cofre da Legião (mesmo ritmo do legionSkeleton).
export default function TreasurySkeleton() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={{ opacity: pulseAnim }}>
      <View className="bg-white rounded-[16px] border border-[#f0eded] p-5 gap-4">
        {/* Título + saldo */}
        <View className="flex-row items-center gap-3">
          <View className="w-9 h-9 rounded-full bg-[#e8e4e4]" />
          <View className="flex-1 gap-2">
            <View className="bg-[#e8e4e4] rounded-full h-3.5 w-1/2" />
            <View className="bg-[#e8e4e4] rounded-full h-5 w-2/3" />
          </View>
        </View>

        {/* Ações */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-[#e8e4e4] rounded-[12px] h-11" />
          <View className="flex-1 bg-[#e8e4e4] rounded-[12px] h-11" />
        </View>

        {/* Movimentações */}
        <View className="gap-2">
          {[1, 2, 3].map((i) => (
            <View key={i} className="bg-[#e8e4e4] rounded-[10px] h-10 w-full" />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}
