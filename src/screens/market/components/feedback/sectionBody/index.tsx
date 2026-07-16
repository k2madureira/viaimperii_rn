import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShopIcon } from '../../../../../components/icons';

interface Props {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorText: string;
  emptyText: string;
  onRetry: () => void;
  children: React.ReactNode;
}

// Estados de carregamento/erro/vazio compartilhados pelas seções.
export default function SectionBody({
  isLoading,
  isError,
  isEmpty,
  errorText,
  emptyText,
  onRetry,
  children,
}: Props) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <View className="py-16 items-center">
        <ActivityIndicator color="#9E1B32" />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="items-center justify-center px-8 gap-3 py-10">
        <Text className="text-[13px] text-[#888] text-center">{errorText}</Text>
        <TouchableOpacity onPress={onRetry} className="bg-primary-500 rounded-[12px] px-5 py-2.5">
          <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (isEmpty) {
    return (
      <View className="bg-white border border-[#f0eded] rounded-[16px] py-12 items-center px-6">
        <ShopIcon size={36} color="#c9b7b7" />
        <Text className="text-[13px] text-[#999] text-center mt-3">{emptyText}</Text>
      </View>
    );
  }
  return <>{children}</>;
}
