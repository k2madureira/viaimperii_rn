import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CoinAmount } from '../../../../../components/icons';

interface Props {
  totalUnits: number;
  totalCoins: number;
  totalXp: number;
  claiming: boolean;
  onPress: () => void;
}

// "Resgatar tudo" — mostra o valor total que será creditado. Some sem resgatáveis.
export default function ClaimAllButton({
  totalUnits,
  totalCoins,
  totalXp,
  claiming,
  onPress,
}: Props) {
  const { t } = useTranslation();
  if (totalUnits <= 0) return null;

  return (
    <TouchableOpacity
      disabled={claiming}
      activeOpacity={0.9}
      onPress={onPress}
      className={`rounded-[16px] px-4 py-3.5 flex-row items-center justify-between ${
        claiming ? 'bg-laurel/60' : 'bg-laurel'
      }`}>
      <View>
        <Text className="text-[14px] font-extrabold text-white">{t('rewards.claimAll')}</Text>
        <Text className="text-[11px] text-white/70 mt-0.5">
          {t('rewards.claimAllCount', { n: totalUnits })}
        </Text>
      </View>
      {claiming ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View className="flex-row items-center gap-2">
          {totalCoins > 0 && <CoinAmount atomic={totalCoins} size={14} textColor="#fff" />}
          {totalXp > 0 && (
            <Text className="text-[13px] font-extrabold text-white">
              +{totalXp}
              {t('common.xp')}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
