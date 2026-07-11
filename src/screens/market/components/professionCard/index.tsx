import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Rect } from 'react-native-svg';
import { CoinAmount, LockIcon } from '../../../../components/icons';
import { Profession } from '../../../../api/professions/professionsApi';

interface Props {
  profession: Profession;
  owned: boolean;
  balance: number; // saldo total (profissões aceitam fundos restritos)
  locked?: boolean; // sem trilha escolhida — compra bloqueada
  buying: boolean;
  onBuy: () => void;
}

const OUTLINE = '#D8D2D2';

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

// Card de profissão comprável — desbloqueia as missões vinculadas.
// Card horizontal único: bloco de imagem quadrado à esquerda, conteúdo à direita,
// tudo dentro de uma borda contínua de cantos amplamente arredondados.
export default function ProfessionCard({ profession: p, owned, balance, locked = false, buying, onBuy }: Props) {
  const { t } = useTranslation();
  const price = p.effective_price ?? p.price;
  const affordable = p.is_free || price <= balance;
  const canBuy = !locked && !owned && affordable;

  return (
    <View className="flex-row items-center gap-2 w-full">
  {/* Lado Esquerdo: Imagem */}
  <View className="items-center justify-center overflow-hidden">
    {p.icon_url ? (
      <Image 
        source={{ uri: p.icon_url }} 
        style={{ width: 100, height: 108 }} 
        resizeMode="contain" 
      />
    ) : (
      <ProfessionGlyph />
    )}
  </View>
  
  {/* Lado Direito: Detalhes - Adicionado flex-1 aqui para não vazar da tela */}
  <View
    className="flex-1 bg-white border border-[#f0eded] rounded-[16px] p-3 gap-2"
    style={locked ? { opacity: 0.6 } : undefined}>
      
    <View className="flex-row items-start gap-2">
      {/* Título e Especialidade */}
      <View className="flex-1">
        <Text className="text-[14px] font-extrabold text-charcoal" numberOfLines={1}>
          {p.name}
        </Text>
        <View className="flex-row items-center gap-1 mt-0.5 flex-wrap">
          <Text className="text-[11px] font-semibold text-primary-500">
            {t('market.professions.missionCount', { n: p.mission_count })}
          </Text>
          {p.specialty_name ? (
            <Text className="text-[11px] text-[#aaa] flex-1" numberOfLines={1}>
              • {p.specialty_name}
            </Text>
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
      <Text className="text-[11px] text-[#888] leading-[15px]" numberOfLines={2}>
        {p.description}
      </Text>
    ) : null}

    <View className="flex-row items-center justify-between mt-1">
      {/* Preço */}
      {p.is_free ? (
        <Text className="text-[13px] font-extrabold text-laurel">{t('market.professions.free')}</Text>
      ) : (
        <View className="flex-row items-center gap-1.5 flex-shrink">
          <CoinAmount atomic={price} size={14} compact />
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
        className={`flex-row items-center justify-center gap-1 rounded-[10px] px-3 py-2 min-w-[90px] ${
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
          <Text className={`text-[11px] font-bold ${canBuy ? 'text-white' : 'text-[#aaa]'}`} numberOfLines={1}>
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
</View>
  );
}
