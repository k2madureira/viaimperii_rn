import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { parseBackendDate } from '../../../../../utils/date';

interface Props {
  remaining: number;
  max: number;
  resetAt?: string;
  label: string;
  rewardedVideoAvailable?: boolean;
  adState?: 'idle' | 'loading' | 'ready' | 'showing' | 'error';
  onWatchAd?: () => void;
}

export default function AllowanceBar({
  remaining,
  max,
  resetAt,
  label,
  rewardedVideoAvailable = false,
  adState = 'idle',
  onWatchAd,
}: Props) {
  const { t } = useTranslation();
  const resetLabel = React.useMemo(() => {
    if (!resetAt) return null;
    const reset = parseBackendDate(resetAt);
    if (!reset) return null;
    const now = new Date();
    const diffMs = reset.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffM = Math.floor((diffMs % 3_600_000) / 60_000);
    if (diffH >= 24) {
      const days = Math.ceil(diffH / 24);
      return t('missions.renewInDays', { count: days });
    }
    if (diffH > 0) {
      return diffM > 0
        ? t('missions.renewInHoursMinutes', { hours: diffH, minutes: diffM })
        : t('missions.renewInHours', { hours: diffH });
    }
    return t('missions.renewInMinutes', { minutes: diffM });
  }, [resetAt, t]);

  const adButtonLabel =
    adState === 'loading' ? t('missions.adLoading')
    : adState === 'showing' ? t('missions.adWatching')
    : t('missions.adWatch');

  const adButtonDisabled = adState === 'loading' || adState === 'showing';

  return (
    <View className="bg-accent-500/10 border border-accent-500/30 rounded-[12px] px-4 py-3 gap-2.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-[11px] font-semibold text-[#9a7b1f] uppercase tracking-[1px]">
            {label}
          </Text>
          <Text className="text-[13px] font-bold text-[#7a5b00] mt-0.5">{t('missions.quotaExhausted')}</Text>
        </View>
        {resetLabel && (
          <View className="bg-white border border-accent-500/20 rounded-[8px] px-3 py-1.5">
            <Text className="text-[11px] font-semibold text-[#7a5b00]">{resetLabel}</Text>
          </View>
        )}
      </View>

      {rewardedVideoAvailable && (
        <TouchableOpacity
          disabled={adButtonDisabled}
          activeOpacity={0.85}
          accessibilityRole="button"
          onPress={onWatchAd}
          className={`rounded-[9px] py-2.5 items-center flex-row justify-center gap-2 ${
            adButtonDisabled ? 'bg-[#e9dcae]' : 'bg-[#D4AF37]'
          }`}>
          {adState === 'loading' ? (
            <ActivityIndicator size="small" color="#7a5b00" />
          ) : null}
          <Text
            className={`text-[13px] font-bold ${adButtonDisabled ? 'text-[#9a7b1f]' : 'text-[#3d2900]'}`}>
            {adButtonLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
