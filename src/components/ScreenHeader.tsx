import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { HamburgerIcon } from '../navigation/icons/MenuIcons';

interface Props {
  title: string;
}

export default function ScreenHeader({ title }: Props) {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#f0f0f0]">
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="pr-3">
        <HamburgerIcon size={24} color="#333" />
      </TouchableOpacity>
      <Text
        className="text-sm font-semibold text-[#111] tracking-[3px]"
        style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
        {title.toUpperCase()}
      </Text>
    </View>
  );
}
