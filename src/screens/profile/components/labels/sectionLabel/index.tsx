import React from 'react';
import { Text } from 'react-native';

interface Props {
  text: string;
}

export default function SectionLabel({ text }: Props) {
  return (
    <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase mb-2">{text}</Text>
  );
}
