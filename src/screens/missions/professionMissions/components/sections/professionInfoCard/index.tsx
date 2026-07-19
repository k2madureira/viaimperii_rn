import React from 'react';
import { Image, Platform, View } from 'react-native';
import Text from '../../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Profession } from '../../../../../../api/professions/professionsApi';
import { ProfessionTheme } from '../../../../../../utils/color';

interface Props {
  profession: Profession;
  theme: ProfessionTheme;
}

// ── Card de explicação da profissão (abaixo da seleção) ─────────────────
export default function ProfessionInfoCard({ profession, theme }: Props) {
  const { t } = useTranslation();
  return (
    <View className="rounded-[20px] p-4 gap-3" style={{ backgroundColor: theme.header }}>
      <View className="flex-row items-center gap-3">
        <View
          className="w-14 h-14 rounded-[14px] items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
          {profession.icon_url ? (
            <Image
              source={{ uri: profession.icon_url }}
              style={{ width: 44, height: 44 }}
              resizeMode="contain"
            />
          ) : (
            <Text className="text-[24px]">🏛️</Text>
          )}
        </View>
        <View className="flex-1">
          <Text
            className="text-[20px] font-extrabold text-white"
            numberOfLines={1}
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {profession.name}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-1 flex-wrap">
            {profession.specialty_name ? (
              <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
                <Text className="text-[10px] font-bold text-white">{profession.specialty_name}</Text>
              </View>
            ) : null}
            <Text className="text-[11px] text-white/60">
              {t('market.professions.missionCount', { n: profession.mission_count })}
            </Text>
          </View>
        </View>
      </View>

      {profession.description ? (
        <Text className="text-[12px] text-white/70 leading-[17px]">{profession.description}</Text>
      ) : null}
    </View>
  );
}
