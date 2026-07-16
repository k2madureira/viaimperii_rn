import React from 'react';
import { TouchableOpacity } from 'react-native';
import Text from '../../../../../components/text';

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function TrackTab({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-1 py-2.5 rounded-[9px] items-center ${active ? 'bg-white' : ''}`}>
      <Text className={`text-[13px] font-bold ${active ? 'text-primary-500' : 'text-[#888]'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
