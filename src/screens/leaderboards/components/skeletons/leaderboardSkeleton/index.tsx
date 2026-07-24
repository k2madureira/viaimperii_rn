import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

// Placeholder de carregamento do placar: linhas fantasma no formato do
// `leaderboardRow` (posição + avatar + nome + xp). Shimmer leve em loop.
function SkeletonRow() {
  return (
    <View
      className="flex-row items-center rounded-[14px] px-3 py-2.5 border border-[#f0eded] bg-white"
      style={{ gap: 10 }}>
      <View className="w-6 h-4 rounded bg-[#ececec]" />
      <View className="w-9 h-9 rounded-full bg-[#ececec]" />
      <View className="flex-1 gap-1.5">
        <View className="h-3 rounded-full bg-[#ececec]" style={{ width: '60%' }} />
        <View className="h-2.5 rounded-full bg-[#f1f1f1]" style={{ width: '35%' }} />
      </View>
      <View className="w-12 h-4 rounded-full bg-[#ececec]" />
    </View>
  );
}

export default function LeaderboardSkeleton({ count = 6 }: { count?: number }) {
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
      <View className="gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </View>
    </Animated.View>
  );
}
