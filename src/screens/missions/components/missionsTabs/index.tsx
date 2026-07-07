import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export type MissionsTab = 'available' | 'inprogress';

interface Props {
  value: MissionsTab;
  onChange: (tab: MissionsTab) => void;
  missionType?: 'daily' | 'monthly';
  // Nº de missões ativas — badge na aba "Ativas" (visibilidade p/ novos usuários).
  activeCount?: number;
}

// Histórico foi movido para a aba "Progresso" (reduz opções na aba de missões).
const TAB_KEYS: MissionsTab[] = ['available', 'inprogress'];

// Cor do tab ativo reflete o tipo de missão selecionado.
const ACTIVE_COLOR: Record<string, string> = {
  daily: '#D4AF37',
  monthly: '#2F7A52',
};

export default function MissionsTabs({ value, onChange, missionType = 'daily', activeCount = 0 }: Props) {
  const { t } = useTranslation();
  const activeColor = ACTIVE_COLOR[missionType];

  return (
    <View className="flex-row bg-[#f4f4f4] rounded-[12px] p-1">
      {TAB_KEYS.map((key) => {
        const active = value === key;
        const showBadge = key === 'inprogress' && activeCount > 0;
        return (
          <TouchableOpacity
            key={key}
            activeOpacity={0.85}
            onPress={() => onChange(key)}
            className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px] ${active ? 'bg-white' : ''}`}
            style={active ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } : undefined}>
            <Text
              className={`text-[13px] font-bold ${active ? '' : 'text-[#aaa]'}`}
              style={active ? { color: activeColor } : undefined}>
              {t(`missionsTabs.${key}`)}
            </Text>
            {showBadge && (
              <View className="bg-primary-500 rounded-full min-w-[18px] px-1 py-0.5 items-center">
                <Text className="text-[10px] font-extrabold text-white leading-none">
                  {activeCount > 99 ? '99+' : activeCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
