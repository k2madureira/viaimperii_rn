import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Segmented control CLARO de tipo (Diárias/Semanais): ativo = pílula branca com o
// texto na cor do tipo; inativo = texto cinza sobre o trilho claro.
interface Props {
  label: string;
  active: boolean;
  activeColor?: string;
  count?: number;
  onPress: () => void;
}

export default function TypeTab({ label, active, activeColor = '#9a7b1f', count, onPress }: Props) {
  const exhausted = count === 0;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={count != null ? `${label}, ${count}` : label}
      style={active ? { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } : undefined}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px]`}>
      <Text className="text-[13px] font-bold" style={{ color: active ? activeColor : '#9a9a9a' }}>
        {label}
      </Text>
      {count != null && (
        <View
          className="px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: active ? `${activeColor}22` : '#e2dada' }}>
          <Text
            className="text-[10px] font-bold"
            style={{ color: exhausted ? '#bbb' : active ? activeColor : '#8a8a8a' }}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
