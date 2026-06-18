import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface Props {
  remaining: number;
  onPress: () => void;
}

export default function LoadMoreButton({ remaining, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="border border-primary rounded-[10px] py-3 items-center bg-white">
      <Text className="text-[13px] font-bold text-primary">
        Buscar mais missões ({remaining})
      </Text>
    </TouchableOpacity>
  );
}
