import React from 'react';
import { ActivityIndicator, View } from 'react-native';

// Spinner centralizado, tingido com a cor da profissão.
interface Props {
  color: string;
}

export default function Loading({ color }: Props) {
  return (
    <View className="py-12 items-center">
      <ActivityIndicator color={color} />
    </View>
  );
}
