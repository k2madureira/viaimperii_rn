import React from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Rect } from 'react-native-svg';
import { CoinAmount, LockIcon } from '../../../../../components/icons';
import { Profession } from '../../../../../api/professions/professionsApi';

interface Props {
  profession: Profession;
  owned: boolean;
  balance: number; // saldo total (profissões aceitam fundos restritos)
  locked?: boolean; // sem trilha escolhida — compra bloqueada
  buying: boolean;
  onBuy: () => void;
}

// Ícone genérico de profissão (pasta/maleta) quando não há icon_url.
function ProfessionGlyph({ size = 44, color = '#9E1B32' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={7} width={18} height={13} rx={2} stroke={color} strokeWidth={1.6} />
      <Path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M3 12h18" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

// Largura reservada para a imagem flutuante à esquerda (sem background próprio).
const ART_WIDTH = 148;
// Quanto o card branco começa DEPOIS da borda esquerda (a imagem sobrepõe o resto).
const CARD_LEFT_INSET = 24;

// Card de profissão comprável — desbloqueia as missões vinculadas.
// Efeito da referência em DOIS elementos: (1) card branco só com as informações,
// cuja borda curva aparece um pouco acima/abaixo da arte; (2) imagem da profissão
// flutuando por cima, SEM background atrás dela.
export default function ProfessionCard({ profession: p, owned, balance, locked = false, buying, onBuy }: Props) {
  const { t } = useTranslation();
  const price = p.effective_price ?? p.price;
  const affordable = p.is_free || price <= balance;
  const canBuy = !locked && !owned && affordable;
  const specColor = p.specialty_color ?? '#5B6B7A';

  return (
    <View className="w-full justify-center" style={locked ? { opacity: 0.6 } : undefined}>
      {/* (1) Card branco das informações — desliza para trás da imagem */}
      <View
        className="bg-white border border-[#eee6e6] rounded-[28px] py-4 pr-4 gap-1"
        style={{ marginLeft: CARD_LEFT_INSET, paddingLeft: ART_WIDTH - CARD_LEFT_INSET + 10, minHeight: 170 }}>
        <View className="flex-row items-start gap-2">
          {/* Título e Especialidade */}
          <View className="flex-1">
            <Text className="text-[16px] font-extrabold text-charcoal" numberOfLines={1}>
              {p.name}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5 flex-wrap">
              <Text className="text-[12px] font-semibold text-primary-500">
                {t('market.professions.missionCount', { n: p.mission_count })}
              </Text>
              {p.specialty_name ? (
                <View
                  className="rounded-full px-2 py-0.5 flex-shrink"
                  style={{ backgroundColor: `${specColor}1A` }}>
                  <Text className="text-[11px] font-bold" numberOfLines={1} style={{ color: specColor }}>
                    {p.specialty_name}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {owned && (
            <View className="bg-laurel/15 rounded-full px-2 py-1 ml-1">
              <Text className="text-[10px] font-bold text-laurel">{t('market.professions.owned')}</Text>
            </View>
          )}
        </View>

        {p.description ? (
          <Text className="text-[12px] text-[#999] leading-[17px]" numberOfLines={3}>
            {p.description}
          </Text>
        ) : null}

        <View className="flex-row items-center justify-between mt-1.5">
          {/* Preço */}
          {p.is_free ? (
            <Text className="text-[13px] font-extrabold text-laurel">{t('market.professions.free')}</Text>
          ) : (
            <View className="flex-row items-center gap-1.5 flex-shrink">
              <CoinAmount atomic={price} size={15} compact />
              {p.on_sale && (
                <View className="bg-primary-500/10 rounded-full px-1.5 py-0.5">
                  <Text className="text-[9px] font-bold text-primary-500">-{p.discount_pct}%</Text>
                </View>
              )}
            </View>
          )}

          {/* Botão de Compra */}
          <TouchableOpacity
            disabled={!canBuy || buying}
            activeOpacity={0.85}
            onPress={onBuy}
            className={`flex-row items-center justify-center gap-1 rounded-[16px] px-5 py-2.5 min-w-[110px] ${
              canBuy && !buying ? 'bg-primary-500' : 'bg-[#efeaea]'
            }`}>
            {buying ? (
              <ActivityIndicator color="#9E1B32" size="small" />
            ) : locked ? (
              <>
                <LockIcon size={11} color="#aaa" />
                <Text className="text-[11px] font-bold text-[#aaa]" numberOfLines={1}>
                  {t('market.professions.lockedShort')}
                </Text>
              </>
            ) : (
              <Text className={`text-[13px] font-bold ${canBuy ? 'text-white' : 'text-[#aaa]'}`} numberOfLines={1}>
                {owned
                  ? t('market.professions.ownedShort')
                  : !affordable
                    ? t('market.notEnough')
                    : t('market.professions.buy')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* (2) Imagem da profissão — flutua sobre o card, sem background atrás */}
      <View
        className="absolute left-0 items-center justify-center"
        pointerEvents="none"
        style={{ width: ART_WIDTH }}>
        {p.icon_url ? (
          <Image
            source={{ uri: p.icon_url }}
            style={{ width: ART_WIDTH, height: 150 }}
            resizeMode="contain"
          />
        ) : (
          <ProfessionGlyph size={64} />
        )}
      </View>
    </View>
  );
}
