import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export type MissionsTab = 'available' | 'history' | 'inprogress';

interface Props {
  value: MissionsTab;
  onChange: (tab: MissionsTab) => void;
  missionType?: 'daily' | 'monthly';
}

const TAB_KEYS: MissionsTab[] = ['available', 'inprogress', 'history'];

// Cor do tab ativo reflete o tipo de missão selecionado.
const ACTIVE_COLOR: Record<string, string> = {
  daily: '#D4AF37',
  monthly: '#2F7A52',
};

export default function MissionsTabs({ value, onChange, missionType = 'daily' }: Props) {
  const { t } = useTranslation();
  const activeColor = ACTIVE_COLOR[missionType];

  return (
    <View className="flex-row bg-[#f4f4f4] rounded-[12px] p-1">
      {TAB_KEYS.map((key) => {
        const active = value === key;
        return (
          <TouchableOpacity
            key={key}
            activeOpacity={0.85}
            onPress={() => onChange(key)}
            className={`flex-1 py-2.5 rounded-[9px] items-center ${active ? 'bg-white' : ''}`}
            style={active ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } : undefined}>
            <Text
              className={`text-[13px] font-bold ${active ? '' : 'text-[#aaa]'}`}
              style={active ? { color: activeColor } : undefined}>
              {t(`missionsTabs.${key}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
