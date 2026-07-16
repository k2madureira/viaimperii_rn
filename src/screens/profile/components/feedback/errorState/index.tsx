import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';

interface Props {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: Props) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-[14px] text-[#888] text-center mb-4">{t('profile.loadError')}</Text>
      <TouchableOpacity onPress={onRetry} className="bg-primary-500 rounded-[12px] px-5 py-2.5">
        <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
      </TouchableOpacity>
    </View>
  );
}
