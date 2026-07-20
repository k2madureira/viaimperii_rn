import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

// Esqueleto do Quartel General (mesmo ritmo do legionSkeleton): cabeçalho,
// carteira, Centurião e territórios.
export default function WarRoomSkeleton() {
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
    <Animated.View style={{ opacity: pulseAnim }} className="px-5 pt-6 gap-5">
      {/* Cabeçalho */}
      <View className="flex-row items-center gap-3">
        <View className="w-14 h-14 rounded-full bg-[#e8e4e4]" />
        <View className="flex-1 gap-2">
          <View className="bg-[#e8e4e4] rounded-full h-5 w-2/3" />
          <View className="bg-[#e8e4e4] rounded-full h-3 w-1/3" />
        </View>
      </View>

      {/* Carteira + Centurião */}
      <View className="bg-white rounded-[16px] border border-[#f0eded] p-5 gap-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-[#e8e4e4]" />
          <View className="flex-1 gap-2">
            <View className="bg-[#e8e4e4] rounded-full h-3.5 w-1/2" />
            <View className="bg-[#e8e4e4] rounded-full h-5 w-2/3" />
          </View>
        </View>
        <View className="bg-[#e8e4e4] rounded-[12px] h-14 w-full" />
        <View className="flex-row gap-2">
          <View className="flex-1 bg-[#e8e4e4] rounded-[12px] h-11" />
          <View className="flex-1 bg-[#e8e4e4] rounded-[12px] h-11" />
        </View>
      </View>

      {/* Territórios */}
      <View className="gap-3">
        <View className="bg-[#e8e4e4] rounded-full h-5 w-1/3" />
        {[1, 2, 3].map((i) => (
          <View key={i} className="bg-[#e8e4e4] rounded-[14px] h-12 w-full" />
        ))}
      </View>
    </Animated.View>
  );
}
