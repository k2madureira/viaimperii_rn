import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';

// Countdown client-side "Reseta em Xd Xh" a partir de `weekEnd` (ISO com offset
// SP). Tick por minuto — o placar não muda de segundo em segundo.
interface Props {
  weekEnd: string;
}

function formatRemaining(ms: number, t: (k: string, o?: any) => string): string {
  if (ms <= 0) return t('leaderboards.resetSoon');
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function ResetCountdown({ weekEnd }: Props) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const end = new Date(weekEnd).getTime();
  if (Number.isNaN(end)) return null;

  const time = formatRemaining(end - now, t);

  return (
    <View className="flex-row items-center gap-1.5">
      <View className="w-1.5 h-1.5 rounded-full bg-primary-500" />
      <Text className="text-[11.5px] font-semibold text-[#8a7f7f]">
        {t('leaderboards.resetIn', { time })}
      </Text>
    </View>
  );
}
