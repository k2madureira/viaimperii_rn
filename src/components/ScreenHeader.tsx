import React from 'react';
import { Platform, Text, View } from 'react-native';
import MenuButton from './MenuButton';

interface Props {
  title: string;
}

export default function ScreenHeader({ title }: Props) {
  return (
    <>
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#f0f0f0]">
        <Text
          className="text-sm font-semibold text-[#111] tracking-[3px]"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {title.toUpperCase()}
        </Text>
      </View>
      <MenuButton />
    </>
  );
}
