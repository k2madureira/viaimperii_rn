import React from 'react';
import { TouchableOpacity } from 'react-native';
import Text from '../../../../../components/text';

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        alignSelf: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        backgroundColor: active ? '#9E1B32' : '#fff',
        borderColor: active ? '#9E1B32' : '#e0dada',
      }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : '#666' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
