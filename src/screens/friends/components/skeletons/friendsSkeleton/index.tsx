import React from 'react';
import { View } from 'react-native';

// Placeholder de carregamento das listas (linhas de amigo/pedido).
export default function FriendsSkeleton() {
  return (
    <View className="gap-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          className="bg-white rounded-[16px] border border-[#f0eded] px-4 py-3 flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-full bg-[#f0eaea]" />
          <View className="flex-1 gap-2">
            <View className="h-3 w-1/2 rounded-full bg-[#f0eaea]" />
            <View className="h-2.5 w-1/3 rounded-full bg-[#f4efef]" />
          </View>
        </View>
      ))}
    </View>
  );
}
