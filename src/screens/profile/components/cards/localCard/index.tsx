import React from 'react';
import { View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { UserCountry } from '../../../../../api/users';
import CountryIcon from '../../icons/countryIcon';
import LocalRow from '../localRow';

interface Props {
  country: UserCountry | null;
  province: string | null;
  track: string | null;
}

export default function LocalCard({ country, province, track }: Props) {
  const { t } = useTranslation();
  return (
    <View className="rounded-[16px] p-5 bg-accent-500">
      <Text className="text-[11px] font-semibold text-[#3d2900]/70 tracking-[3px] uppercase">
        {t('profile.locationTitle')}
      </Text>
      <View className="h-3.5" />
      <View className="gap-3">
        {/* País — usa o ícone do país (SVG remoto → SvgUri; Image não renderiza SVG) */}
        <LocalRow
          label={t('profile.country')}
          value={country?.name ?? '—'}
          chip={<CountryIcon url={country?.icon_url ?? null} />}
        />
        <LocalRow
          label={t('profile.province')}
          value={province ?? '—'}
          chip={<Text className="text-[15px]">📍</Text>}
        />
        <LocalRow
          label={t('profile.track')}
          value={track ?? t('profile.noTrack')}
          chip={<Text className="text-[15px]">🛡️</Text>}
        />
      </View>
    </View>
  );
}
