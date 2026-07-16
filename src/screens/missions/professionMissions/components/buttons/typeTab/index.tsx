import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Segmented control de tipo (Diárias/Semanais) sobre o cabeçalho colorido da
// profissão: ativo = pílula branca; inativo = texto claro translúcido.
interface Props {
  label: string;
  active: boolean;
  count?: number;
  onPress: () => void;
}

export default function TypeTab({ label, active, count, onPress }: Props) {
  const exhausted = count === 0;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={active ? { backgroundColor: 'rgba(255,255,255,0.9)' } : undefined}
      className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px]">
      <Text className={`text-[13px] font-bold ${active ? 'text-[#1c1c1c]' : 'text-white/50'}`}>{label}</Text>
      {count != null && (
        <View
          className="px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: active ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.2)' }}>
          <Text className={`text-[10px] font-bold ${active ? 'text-[#1c1c1c]' : 'text-white'}`}>
            {exhausted ? 0 : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
