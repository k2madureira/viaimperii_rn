import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

// Esqueleto pulsante enquanto as legiões (e suas imagens) carregam.
export default function LegionSkeleton() {
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
    <View className="gap-4">
      {/* Badge row skeleton */}
      <Animated.View style={{ opacity: pulseAnim }} className="flex-row gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="bg-[#e8e4e4] rounded-full" style={{ width: 60, height: 60 }} />
        ))}
      </Animated.View>

      {/* Card skeleton */}
      <Animated.View style={{ opacity: pulseAnim }}>
        <View className="bg-white rounded-[16px] border border-[#f0eded] p-5 gap-4">
          <View className="flex-row items-center gap-4">
            <View className="w-20 h-20 rounded-full bg-[#e8e4e4]" />
            <View className="flex-1 gap-2">
              <View className="bg-[#e8e4e4] rounded-full h-5 w-3/4" />
              <View className="bg-[#e8e4e4] rounded-full h-3 w-1/2" />
            </View>
          </View>
          <View className="gap-2">
            <View className="bg-[#e8e4e4] rounded-[10px] h-4 w-full" />
            <View className="bg-[#e8e4e4] rounded-[10px] h-4 w-5/6" />
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1 bg-[#e8e4e4] rounded-[14px] h-20" />
            <View className="flex-1 bg-[#e8e4e4] rounded-[14px] h-20" />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
