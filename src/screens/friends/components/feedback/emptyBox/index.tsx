import React from 'react';
import { View } from 'react-native';
import Text from '../../../../../components/text';

interface Props {
  title: string;
  subtitle?: string;
}

// Estado vazio genérico das listas de amigos/pedidos.
export default function EmptyBox({ title, subtitle }: Props) {
  return (
    <View className="items-center justify-center py-16 px-8">
      <Text className="text-[15px] font-bold text-charcoal text-center">{title}</Text>
      {subtitle ? (
        <Text className="text-[13px] text-[#888] text-center mt-1.5 leading-[19px]">{subtitle}</Text>
      ) : null}
    </View>
  );
}
