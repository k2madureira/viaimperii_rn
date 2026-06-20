import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StatsPeriod } from '../../../../api/users/userApi';

interface Props {
  value: StatsPeriod;
  onChange: (period: StatsPeriod) => void;
}

const OPTIONS: { key: StatsPeriod; label: string }[] = [
  { key: 'weekly', label: 'Semana' },
  { key: 'monthly', label: 'Mês' },
  { key: 'annual', label: 'Ano' },
  { key: 'all', label: 'Tudo' },
];

export default function StatsFilter({ value, onChange }: Props) {
  return (
    <View className="flex-row gap-2">
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            activeOpacity={0.8}
            onPress={() => onChange(opt.key)}
            className={`flex-1 py-2 rounded-[10px] items-center border ${active ? 'bg-primary border-primary' : 'bg-white border-[#e0e0e0]'}`}>
            <Text className={`text-[12px] font-bold ${active ? 'text-white' : 'text-[#666]'}`}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
