import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  remaining: number;
  onPress: () => void;
}

export default function LoadMoreButton({ remaining, onPress }: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="border border-primary-500 rounded-[10px] py-3 items-center bg-white">
      <Text className="text-[13px] font-bold text-primary-500">
        {t('missions.loadMore', { count: remaining })}
      </Text>
    </TouchableOpacity>
  );
}
