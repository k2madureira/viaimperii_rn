import React from 'react';
import { View } from 'react-native';
import Text from '../../../../../components/text';

interface Props {
  label: string;
  value: string;
  chip: React.ReactNode;
}

export default function LocalRow({ label, value, chip }: Props) {
  return (
    <View className="flex-row items-center">
      <View className="w-9 h-9 rounded-full bg-white/30 items-center justify-center overflow-hidden mr-3">
        {chip}
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-bold text-[#3d2900]/60 uppercase tracking-[1px]">{label}</Text>
        <Text className="text-[15px] font-extrabold text-[#3d2900]" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}
