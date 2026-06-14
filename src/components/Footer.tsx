import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      className="h-12 items-center justify-center bg-white"
      style={{ paddingBottom: insets.bottom }}>
      <Text className="text-[11px] text-[#ccc]">
        {t('common.copyright', { year: CURRENT_YEAR })}
      </Text>
    </View>
  );
}
