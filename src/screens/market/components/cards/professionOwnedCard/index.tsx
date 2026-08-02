import React from 'react';
import { Image, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Rect } from 'react-native-svg';
import { Profession } from '../../../../../api/professions';

interface Props {
  profession: Profession;
}

// Glifo compacto de profissão (pasta/maleta) quando não há icon_url.
function ProfessionGlyph({ size = 26, color = '#9E1B32' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={7} width={18} height={13} rx={2} stroke={color} strokeWidth={1.6} />
      <Path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M3 12h18" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

// Card reduzido para profissões já adquiridas: só ícone pequeno, título,
// contagem de missões e selo "Adquirida". Vai no fim da lista do mercado.
export default function ProfessionOwnedCard({ profession: p }: Props) {
  const { t } = useTranslation();
  const specColor = p.specialty_color ?? '#5B6B7A';

  return (
    <View className="bg-white border border-[#eee6e6] rounded-[16px] px-3 py-2.5 flex-row items-center gap-3">
      <View className="w-9 h-9 items-center justify-center">
        {p.icon_url ? (
          <Image source={{ uri: p.icon_url }} style={{ width: 36, height: 36 }} resizeMode="contain" />
        ) : (
          <ProfessionGlyph size={26} />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-[14px] font-extrabold text-charcoal" numberOfLines={1}>
          {p.name}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          <Text className="text-[11px] font-semibold text-primary-500">
            {t('market.professions.missionCount', { n: p.mission_count })}
          </Text>
          {p.specialty_name ? (
            <Text className="text-[11px] font-bold" numberOfLines={1} style={{ color: specColor }}>
              · {p.specialty_name}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="bg-laurel/15 rounded-full px-2.5 py-1">
        <Text className="text-[10px] font-bold text-laurel">{t('market.professions.owned')}</Text>
      </View>
    </View>
  );
}
