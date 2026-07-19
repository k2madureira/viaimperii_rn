import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../../components/text';

// Aba de status (Disponíveis/Em andamento) dentro do box de missões, tingida
// com a cor da profissão quando ativa.
interface Props {
  label: string;
  active: boolean;
  color: string;
  badge?: number;
  onPress: () => void;
}

export default function StatusTab({ label, active, color, badge, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px] ${active ? 'bg-white' : ''}`}
      style={active ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } : undefined}>
      <Text className="text-[13px] font-bold" style={{ color: active ? color : '#aaa' }}>
        {label}
      </Text>
      {badge != null && badge > 0 && (
        <View className="rounded-full min-w-[18px] px-1 py-0.5 items-center" style={{ backgroundColor: color }}>
          <Text className="text-[10px] font-extrabold text-white leading-none">
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
