import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../../components/text';
import { LegionCountry } from '../../../../../../api/legion';

interface Props {
  country: LegionCountry;
  color: string;
}

// País do território da legião: colapsado mostra só o total do país; tocar
// revela as províncias.
//
// As províncias já vêm aninhadas em `GET /legions/{id}` — expandir é estado
// local, NÃO uma nova requisição. Colapsar existe porque uma legião grande
// espalha por dezenas de províncias e a lista inteira aberta enterra os demais
// blocos da tela.
export default function CountryCard({ country, color }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const provinces = country.provinces ?? [];
  // Total do país = soma das províncias (o contrato não manda um agregado).
  const totalUsers = provinces.reduce((sum, p) => sum + p.quantityUsers, 0);

  return (
    <View className="bg-white rounded-[14px] border border-[#f0eded] overflow-hidden">
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="flex-row items-center px-4 py-3 gap-2">
        {country.icon_url ? (
          country.icon_url.toLowerCase().endsWith('.svg') ? (
            <SvgUri uri={country.icon_url} width={22} height={22} />
          ) : (
            <Image
              source={{ uri: country.icon_url }}
              style={{ width: 22, height: 22 }}
              resizeMode="contain"
            />
          )
        ) : null}

        <Text className="text-[14px] font-bold text-[#111] flex-1" numberOfLines={1}>
          {country.name}
        </Text>

        <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${color}15` }}>
          <Text className="text-[11.5px] font-bold" style={{ color }}>
            {totalUsers} {t('legions.users')}
          </Text>
        </View>

        <Text className="text-[12px] text-[#bbb] ml-0.5">{open ? '▾' : '▸'}</Text>
      </TouchableOpacity>

      {open &&
        (provinces.length === 0 ? (
          <View className="px-4 py-3 border-t border-[#f5f2f2]">
            <Text className="text-[12px] text-[#999]">{t('legions.noProvinces')}</Text>
          </View>
        ) : (
          provinces.map((province) => (
            <View
              key={province.id}
              className="flex-row items-center px-4 py-2.5 border-t border-[#faf7f7]">
              <Text className="text-[13px] text-[#333] flex-1" numberOfLines={1}>
                {province.name}
              </Text>
              <Text className="text-[11.5px] font-semibold" style={{ color }}>
                {province.quantityUsers} {t('legions.users')}
              </Text>
            </View>
          ))
        ))}
    </View>
  );
}
