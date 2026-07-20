import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../../components/text';
import { LegionCountry } from '../../../../../../api/legion';
import CountryCard from '../../cards/countryCard';

interface Props {
  countries: LegionCountry[];
  color: string;
}

// Territórios do Quartel General: lista só os PAÍSES com o total agregado;
// as províncias aparecem ao expandir cada país (dado já carregado).
export default function WarRoomTerritories({ countries, color }: Props) {
  const { t } = useTranslation();

  return (
    <View>
      <Text className="text-[15px] font-extrabold text-[#111] mb-3">
        {t('legions.territories')}
      </Text>

      {countries.length === 0 ? (
        <View className="bg-white rounded-[14px] border border-[#f0eded] px-4 py-6 items-center">
          <Text className="text-[13px] text-[#888]">{t('legions.noTerritories')}</Text>
        </View>
      ) : (
        <View className="gap-3">
          {countries.map((country) => (
            <CountryCard key={country.id} country={country} color={color} />
          ))}
        </View>
      )}
    </View>
  );
}
