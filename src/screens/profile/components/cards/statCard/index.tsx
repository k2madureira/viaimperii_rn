import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  value: number;
  label: string;
  loading?: boolean;
}

export default function StatCard({ value, label, loading }: Props) {
  return (
    <View
      className="bg-white border border-[#f0eded] rounded-[14px] py-3.5 px-2 items-center"
      style={{ width: '31.5%' }}>
      {loading ? (
        <View className="h-7 w-10 bg-[#f0eded] rounded-[6px]" />
      ) : (
        <Text className="text-[20px] font-extrabold text-charcoal">{value.toLocaleString()}</Text>
      )}
      <Text className="text-[10px] text-[#999] mt-1 text-center" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}
