import React from 'react';
import { Text, View } from 'react-native';
import { MASTERY_ICONS } from '../../../../../components/icons';

interface Props {
  name: string;
  value: number;
}

export default function MasteryRow({ name, value }: Props) {
  const Icon = MASTERY_ICONS[name.toLowerCase()];
  const pct = Math.max(0, Math.min(100, value));
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  return (
    <View>
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center">
          {Icon ? <Icon size={16} color="#6B1221" /> : null}
          <Text className="text-[13px] font-semibold text-charcoal ml-2">{label}</Text>
        </View>
        <Text className="text-[12px] font-bold text-[#888]">{value}/100</Text>
      </View>
      <View className="h-1.5 bg-[#f0eded] rounded-full overflow-hidden">
        <View className="h-1.5 bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}
