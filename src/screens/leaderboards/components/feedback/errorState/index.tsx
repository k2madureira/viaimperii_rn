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
    <View className="py-10 items-center gap-3">
      <Text className="text-[13px] text-[#888] text-center">{t('leaderboards.loadError')}</Text>
      <TouchableOpacity onPress={onRetry} className="bg-primary-500 rounded-[12px] px-5 py-2.5">
        <Text className="text-[13px] font-bold text-white">{t('leaderboards.retry')}</Text>
      </TouchableOpacity>
    </View>
  );
}
