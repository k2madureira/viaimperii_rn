import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';

interface Props {
  label: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}

// Aba segmentada (Amigos / Pedidos) com contador opcional de pendências.
export default function FriendsTab({ label, active, badge, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[12px] ${
        active ? 'bg-primary-500' : 'bg-transparent'
      }`}>
      <Text className={`text-[13px] font-bold ${active ? 'text-white' : 'text-[#888]'}`}>
        {label}
      </Text>
      {badge != null && badge > 0 && (
        <View
          className={`min-w-[18px] h-[18px] px-1 rounded-full items-center justify-center ${
            active ? 'bg-white' : 'bg-primary-500'
          }`}>
          <Text
            className={`text-[10px] font-extrabold leading-none ${
              active ? 'text-primary-500' : 'text-white'
            }`}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
