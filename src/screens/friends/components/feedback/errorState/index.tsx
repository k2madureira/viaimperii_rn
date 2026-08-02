import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';

interface Props {
  message?: string;
  onRetry: () => void;
}

// Estado de erro com botão de tentar novamente.
export default function ErrorState({ message, onRetry }: Props) {
  const { t } = useTranslation();

  return (
    <View className="items-center justify-center py-16 px-8">
      <Text className="text-[15px] font-bold text-charcoal text-center">
        {t('friends.error.title')}
      </Text>
      {message ? (
        <Text className="text-[12px] text-[#888] text-center mt-1.5 leading-[18px]">{message}</Text>
      ) : null}
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.85}
        className="mt-4 px-5 py-2.5 rounded-[12px] bg-primary-500">
        <Text className="text-[13px] font-bold text-white">{t('friends.error.retry')}</Text>
      </TouchableOpacity>
    </View>
  );
}
