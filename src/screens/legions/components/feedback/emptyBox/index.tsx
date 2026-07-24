import React from 'react';
import { View } from 'react-native';
import Text from '../../../../../components/text';

interface Props {
  text: string;
  emoji?: string;
}

// Estado vazio compacto usado dentro dos blocos da tela de Legiões
// (ex.: cofre sem tributos registrados).
export default function EmptyBox({ text, emoji = '🏛️' }: Props) {
  return (
    <View className="bg-[#faf7f7] border border-[#f0eded] rounded-[12px] py-7 items-center px-5">
      <Text className="text-[22px] mb-1.5">{emoji}</Text>
      <Text className="text-[12px] text-[#888] text-center leading-[17px]">{text}</Text>
    </View>
  );
}
