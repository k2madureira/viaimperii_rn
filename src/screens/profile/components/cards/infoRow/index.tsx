import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  label: string;
  value: string;
  last?: boolean;
}

export default function InfoRow({ label, value, last }: Props) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3.5 ${last ? '' : 'border-b border-[#f4f1f1]'}`}>
      <Text className="text-[13px] text-[#888]">{label}</Text>
      <Text className="text-[14px] font-semibold text-charcoal" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
