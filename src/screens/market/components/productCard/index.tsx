import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CoinAmount } from '../../../../components/icons';
import { PhysicalProduct } from '../../../../api/physical/physicalApi';
import ProductPlaceholder from '../productPlaceholder';
import { TYPE_COLOR } from '../icons';

interface Props {
  product: PhysicalProduct;
  redeeming: boolean;
  onRedeem: () => void;
}
 
// Card de produto do mercado. Enquanto o backend não fornece `image_url`, mostra
// um placeholder SVG por tipo (substituído pela imagem real quando existir).
export default function ProductCard({ product, redeeming, onRedeem }: Props) {
  const { t } = useTranslation();
  const soldOut = product.stock != null && product.stock <= 0;
  const canRedeem = product.affordable !== false && !soldOut && product.is_active;
  const typeColor = TYPE_COLOR[product.product_type] ?? '#9E1B32';

  return (
    <View className="bg-white border border-[#f0eded] rounded-[16px] overflow-hidden flex-1">
      {/* Mídia: imagem real quando houver, senão placeholder SVG (colorido por tipo) */}
      <View className="h-28 items-center justify-center" style={{ backgroundColor: `${typeColor}12` }}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <ProductPlaceholder type={product.product_type} size={52} color={typeColor} />
        )}
      </View>

      <View className="p-3 gap-1">
        <Text className="text-[13px] font-bold text-charcoal" numberOfLines={1}>
          {product.name}
        </Text>
        {product.description ? (
          <Text className="text-[11px] text-[#999] leading-[15px]" numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}

        <View className="mt-1">
          <CoinAmount atomic={product.price} size={13} compact />
        </View>

        {soldOut ? (
          <Text className="text-[10px] font-bold text-[#c0392b] mt-0.5">{t('market.soldOut')}</Text>
        ) : product.stock != null ? (
          <Text className="text-[10px] text-[#aaa] mt-0.5">
            {t('market.stock', { n: product.stock })}
          </Text>
        ) : null}

        <TouchableOpacity
          disabled={!canRedeem || redeeming}
          activeOpacity={0.85}
          onPress={onRedeem}
          className={`mt-2 rounded-[12px] py-2.5 items-center ${
            canRedeem && !redeeming ? 'bg-primary-500' : 'bg-[#efeaea]'
          }`}>
          {redeeming ? (
            <ActivityIndicator color="#9E1B32" size="small" />
          ) : (
            <Text className={`text-[12px] font-bold ${canRedeem ? 'text-white' : 'text-[#aaa]'}`}>
              {soldOut
                ? t('market.soldOut')
                : product.affordable === false
                  ? t('market.notEnough')
                  : t('market.redeem')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
