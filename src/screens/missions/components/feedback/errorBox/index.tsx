import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  text: string;
}

export default function ErrorBox({ text }: Props) {
  return (
    <View className="bg-white border border-[#f0eded] rounded-[14px] py-10 items-center px-6">
      <Text className="text-[13px] text-[#c0392b] text-center">{text}</Text>
    </View>
  );
}
