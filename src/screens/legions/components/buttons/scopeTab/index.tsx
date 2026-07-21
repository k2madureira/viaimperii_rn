import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';

export interface ScopeOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface Props<T extends string> {
  options: ScopeOption<T>[];
  value: T;
  color: string;
  onChange: (value: T) => void;
}

// Abas segmentadas do board (escopo Global / País / Província).
//
// Uma aba desabilitada continua VISÍVEL: o escopo territorial depende de o
// viewer ter província definida, e esconder a aba não explicaria por que ela
// sumiu.
export default function ScopeTab<T extends string>({ options, value, color, onChange }: Props<T>) {
  return (
    <View className="flex-row bg-[#f4eaea] rounded-[12px] p-1 gap-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={option.disabled || active}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled: option.disabled }}
            className={`flex-1 rounded-[9px] py-2 items-center ${
              option.disabled ? 'opacity-35' : ''
            }`}
            style={{ backgroundColor: active ? color : 'transparent' }}>
            <Text
              className="text-[12px] font-bold"
              style={{ color: active ? '#fff' : '#8a7a7a' }}
              numberOfLines={1}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
