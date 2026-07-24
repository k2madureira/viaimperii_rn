import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

// Esqueleto do ranking de legiões (mesmo ritmo do legionSkeleton).
export default function BoardSkeleton() {
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
    <Animated.View style={{ opacity: pulseAnim }} className="gap-2.5">
      <View className="bg-[#e8e4e4] rounded-[12px] h-10 w-full" />
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} className="flex-row items-center gap-3 bg-[#faf7f7] rounded-[12px] px-3 py-2.5">
          <View className="w-6 h-3 rounded-full bg-[#e8e4e4]" />
          <View className="w-9 h-9 rounded-full bg-[#e8e4e4]" />
          <View className="flex-1 gap-2">
            <View className="bg-[#e8e4e4] rounded-full h-3.5 w-2/3" />
            <View className="bg-[#e8e4e4] rounded-full h-2.5 w-1/2" />
          </View>
          <View className="bg-[#e8e4e4] rounded-full h-3.5 w-14" />
        </View>
      ))}
    </Animated.View>
  );
}
