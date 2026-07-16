import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Acesso SECUNDÁRIO (C4 ação-first): pílula compacta com ícone + rótulo (e badge
// opcional) para Progresso/Revisão, sem competir com a ação principal (Missões).
interface Props {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  badge?: number;
  onPress: () => void;
}

export default function SecondaryNav({ icon: Icon, label, badge, onPress }: Props) {
  const hasBadge = badge != null && badge > 0;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hasBadge ? `${label}, ${badge}` : label}
      className="flex-row items-center gap-1.5 pl-3 pr-3.5 py-2 rounded-full bg-white border border-[#ece6e6]">
      <Icon size={15} color="#6B1221" />
      <Text className="text-[12px] font-bold text-[#6B1221]">{label}</Text>
      {hasBadge && (
        <View className="bg-primary-500 rounded-full min-w-[18px] px-1 py-0.5 items-center">
          <Text className="text-[10px] font-extrabold text-white leading-none">
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
