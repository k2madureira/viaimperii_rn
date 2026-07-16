import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

/**
 * Placeholder de carregamento das listas de missões (B1). Substitui o spinner
 * "vazio" por cards fantasma no mesmo formato do MissionItem, reduzindo o salto de
 * layout e dando percepção de velocidade. Pulsa a opacidade em loop (shimmer leve).
 */
function SkeletonCard() {
  return (
    <View
      className="border border-[#f0eded] rounded-[16px] p-4 bg-white"
      style={{ borderLeftWidth: 4, borderLeftColor: '#ededed' }}>
      <View className="flex-row items-start">
        <View className="w-11 h-11 rounded-[12px] bg-[#ececec] mr-3" />
        <View className="flex-1 gap-2 pt-0.5">
          <View className="h-3.5 rounded-full bg-[#ececec]" style={{ width: '72%' }} />
          <View className="flex-row gap-1.5">
            <View className="h-4 w-14 rounded-full bg-[#f1f1f1]" />
            <View className="h-4 w-16 rounded-full bg-[#f1f1f1]" />
          </View>
        </View>
        <View className="w-12 h-10 rounded-[10px] bg-[#ececec] ml-1" />
      </View>
      <View className="h-9 rounded-[10px] bg-[#f1f1f1] mt-3" />
    </View>
  );
}

export default function MissionSkeleton({ count = 3 }: { count?: number }) {
  const v = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [v]);

  return (
    <Animated.View style={{ opacity: v }}>
      <View className="gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </View>
    </Animated.View>
  );
}
