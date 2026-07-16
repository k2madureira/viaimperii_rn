import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: Props) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <Text className="text-[13px] text-[#888] text-center">{t('achievements.loadError')}</Text>
      <TouchableOpacity onPress={onRetry} className="bg-primary-500 rounded-[12px] px-5 py-2.5">
        <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
      </TouchableOpacity>
    </View>
  );
}
