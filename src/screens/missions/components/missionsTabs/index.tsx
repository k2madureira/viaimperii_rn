import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export type MissionsTab = 'available' | 'history' | 'inprogress';

interface Props {
  value: MissionsTab;
  onChange: (tab: MissionsTab) => void;
}

const TABS: { key: MissionsTab; label: string }[] = [
  { key: 'available', label: 'Disponíveis' },
  { key: 'inprogress', label: 'Ativas' },
  { key: 'history', label: 'Histórico' },
];

export default function MissionsTabs({ value, onChange }: Props) {
  return (
    <View className="flex-row bg-[#f0eded] rounded-[12px] p-1">
      {TABS.map((tab) => {
        const active = value === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.85}
            onPress={() => onChange(tab.key)}
            className={`flex-1 py-2.5 rounded-[9px] items-center ${active ? 'bg-white' : ''}`}>
            <Text className={`text-[13px] font-bold ${active ? 'text-primary' : 'text-[#888]'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
