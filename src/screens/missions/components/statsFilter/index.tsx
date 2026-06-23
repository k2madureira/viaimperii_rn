import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatsPeriod } from '../../../../api/users/userApi';

interface Props {
  value: StatsPeriod;
  onChange: (period: StatsPeriod) => void;
}

const OPTION_KEYS: StatsPeriod[] = ['weekly', 'monthly', 'annual', 'all'];

export default function StatsFilter({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <View className="flex-row gap-2">
      {OPTION_KEYS.map((key) => {
        const active = value === key;
        return (
          <TouchableOpacity
            key={key}
            activeOpacity={0.8}
            onPress={() => onChange(key)}
            className={`flex-1 py-2 rounded-[10px] items-center border ${
              active ? 'bg-[#6B1221] border-[#6B1221]' : 'bg-white border-[#e0e0e0]'
            }`}>
            <Text className={`text-[12px] font-bold ${active ? 'text-white' : 'text-[#888]'}`}>
              {t(`statsFilter.${key}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
