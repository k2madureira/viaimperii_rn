import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PRODUCT_TYPES, ProductType } from '../../../../../api/physical/physicalApi';
import { ShopIcon } from '../../../../../components/icons';
import ProductPlaceholder from '../../cards/productPlaceholder';
import { TYPE_COLOR } from '../../icons';

interface Props {
  value: ProductType | null;
  onChange: (type: ProductType | null) => void;
}

// Filtro de tipo de produto (chips), cada tipo com seu ícone SVG e cor-tema.
export default function TypeFilter({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
      <Chip
        type={null}
        label={t('market.types.all')}
        active={value === null}
        onPress={() => onChange(null)}
      />
      {PRODUCT_TYPES.map((type) => (
        <Chip
          key={type}
          type={type}
          label={t(`market.types.${type}`)}
          active={value === type}
          onPress={() => onChange(type)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  type,
  label,
  active,
  onPress,
}: {
  type: ProductType | null;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const color = TYPE_COLOR[type ?? 'all'];
  const iconColor = active ? '#fff' : color;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={active ? { backgroundColor: color, borderColor: color } : { borderColor: `${color}55` }}
      className={`flex-row items-center gap-1.5 pl-2.5 pr-4 py-1.5 rounded-full border ${
        active ? '' : 'bg-white'
      }`}>
      {type ? (
        <ProductPlaceholder type={type} size={16} color={iconColor} />
      ) : (
        <ShopIcon size={15} color={iconColor} />
      )}
      <Text className="text-[12px] font-semibold" style={{ color: active ? '#fff' : '#666' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
