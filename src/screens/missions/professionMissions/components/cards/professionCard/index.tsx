import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Profession } from '../../../../../../api/professions/professionsApi';
import { normalizeHex, withAlpha } from '../../../../../../utils/color';

interface Props {
  profession: Profession;
  // Profissão atualmente selecionada no carrossel — realça a borda/fundo.
  selected?: boolean;
  onPress: () => void;
}

// Card de profissão adquirida (carrossel horizontal) — imagem grande flutuando
// sobre o card, tematizado pela cor da própria profissão.
export const PROF_CARD_WIDTH = 158;
export const PROF_ART_SIZE = 92;

export default function ProfessionCard({ profession, selected = false, onPress }: Props) {
  const { t } = useTranslation();
  const color = normalizeHex(profession.color ?? profession.specialty_color);
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} accessibilityRole="button">
      <View style={{ width: PROF_CARD_WIDTH }}>
        {/* Card com espaço reservado no topo para a arte flutuante */}
        <View
          className="rounded-[20px] px-3 pb-3.5 items-center"
          style={{
            paddingTop: PROF_ART_SIZE / 2 + 10,
            backgroundColor: withAlpha(color, selected ? 0.16 : 0.1),
            borderWidth: selected ? 2 : 1,
            borderColor: withAlpha(color, selected ? 0.55 : 0.28),
          }}>
          <Text className="text-[13px] font-extrabold text-charcoal text-center" numberOfLines={1}>
            {profession.name}
          </Text>
          <View className="rounded-full px-2 py-0.5 mt-1.5" style={{ backgroundColor: withAlpha(color, 0.16) }}>
            <Text className="text-[10px] font-bold" numberOfLines={1} style={{ color }}>
              {t('market.professions.missionCount', { n: profession.mission_count })}
            </Text>
          </View>
          <View
            className="flex-row items-center gap-1 rounded-full px-3 py-1.5 mt-2.5"
            style={{ backgroundColor: color }}>
            <Text className="text-[11px] font-bold text-white">
              {selected ? t('professionMissions.selected') : t('professionMissions.open')}
            </Text>
            {!selected && <Text className="text-[12px] font-bold text-white">›</Text>}
          </View>
        </View>

        {/* Arte flutuante — sem fundo, sobreposta ao topo do card */}
        <View
          className="absolute left-0 right-0 items-center"
          pointerEvents="none"
          style={{ top: -(PROF_ART_SIZE / 2) }}>
          {profession.icon_url ? (
            <Image
              source={{ uri: profession.icon_url }}
              style={{ width: PROF_ART_SIZE, height: PROF_ART_SIZE }}
              resizeMode="contain"
            />
          ) : (
            <View
              className="rounded-full items-center justify-center"
              style={{ width: PROF_ART_SIZE, height: PROF_ART_SIZE, backgroundColor: withAlpha(color, 0.2) }}>
              <Text className="text-[34px]">🏛️</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
