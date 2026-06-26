import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PlusCircleIcon, PrimusPilusEmblem } from '../../../../../components/icons';

interface Props {
  count: number; // missões diárias disponíveis agora
  xp: number; // XP somado das missões disponíveis
  onPress: () => void;
}

/**
 * Card compacto de missões (ocupa ~30% ao lado do card de Patente, mesma altura).
 * Usa o emblema Primus Pilus como imagem, mostra o título "Missões", o nº de
 * diárias + XP, e um botão (+) que leva à tela de Missões.
 */
export default function MissionsSummaryCard({ count, xp, onPress }: Props) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-[#6B1221] rounded-[20px] p-3 flex-1 items-center justify-center">
      <Text className="text-[11px] font-bold text-white/70 tracking-[1px] uppercase">
        {t('missionsSummary.title')}
      </Text>

      <PrimusPilusEmblem size={36} />

      <Text className="text-[26px] font-extrabold text-white leading-[30px]">{count}</Text>
      <Text className="text-[9px] font-bold text-white/55 tracking-[1px] uppercase">
        {t('missionsSummary.available')}
      </Text>

      {xp > 0 && (
        <View className="bg-gold/25 rounded-full px-2.5 py-0.5 mt-1.5">
          <Text className="text-[11px] font-bold text-gold">+{xp} XP</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="mt-2.5">
        <PlusCircleIcon size={30} color="#ffffff" strokeWidth={2} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
