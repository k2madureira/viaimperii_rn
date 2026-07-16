import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  text: string;
  emoji?: string;
}

export default function EmptyBox({ text, emoji = '🏛️' }: Props) {
  return (
    <View className="bg-white border border-[#f0eded] rounded-[14px] py-10 items-center px-6">
      <Text className="text-[26px] mb-2">{emoji}</Text>
      <Text className="text-[13px] text-[#777] text-center leading-[18px]">{text}</Text>
    </View>
  );
}
