import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PhysicalProduct, ProductType } from '../../../../../api/physical/physicalApi';
import { useRedeemProduct } from '../../../model/mutations/useRedeemProduct';
import TypeFilter from '../../filters/typeFilter';
import ProductCard from '../../cards/productCard';
import SectionBody from '../../feedback/sectionBody';

interface Props {
  products: PhysicalProduct[];
  type: ProductType | null;
  onChangeType: (type: ProductType | null) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

// Seção de produtos físicos: filtro por tipo + grade de cards resgatáveis.
export default function ProductsSection({
  products,
  type,
  onChangeType,
  isLoading,
  isError,
  onRetry,
}: Props) {
  const { t } = useTranslation();
  const redeemM = useRedeemProduct();
  const redeemingSlug = redeemM.isPending ? redeemM.variables?.slug ?? null : null;

  return (
    <View className="gap-3">
      <TypeFilter value={type} onChange={onChangeType} />
      <SectionBody
        isLoading={isLoading}
        isError={isError}
        isEmpty={products.length === 0}
        errorText={t('market.loadError')}
        emptyText={t('market.empty')}
        onRetry={onRetry}>
        <View className="flex-row flex-wrap justify-between">
          {products.map((item) => (
            <View key={item.slug} style={{ width: '48%', marginBottom: 12 }}>
              <ProductCard
                product={item}
                redeeming={redeemingSlug === item.slug}
                onRedeem={() => redeemM.mutate({ slug: item.slug })}
              />
            </View>
          ))}
        </View>
      </SectionBody>
    </View>
  );
}
