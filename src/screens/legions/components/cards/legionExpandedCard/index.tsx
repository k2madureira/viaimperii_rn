import React, { useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LegionAttributes } from '../../../../../components';
import { Legion } from '../../../../../api/legion/dto';
import { HomeNavigationProp } from '../../../../../navigation/HomeStack';
import ChangeLegionModal from '../../modals/changeLegionModal';

interface Props {
  legion: Legion;
  color: string;
  isUserLegion: boolean;
  userHasLegion: boolean;
  totalXp: number;
  userId: string | undefined;
}

// Card expandido da legião selecionada: brasão, atributos e ação principal
// (entrar no QG, trocar de legião ou dica de ingresso).
export default function LegionExpandedCard({
  legion,
  color,
  isUserLegion,
  userHasLegion,
  totalXp,
  userId,
}: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <View
        className="bg-white rounded-[16px] border border-[#f0eded] overflow-hidden"
        style={{ borderTopWidth: 4, borderTopColor: color }}>
        {/* Header */}
        <View className="items-center px-5 pt-5">
          <View
            className="w-24 h-24 rounded-full items-center justify-center overflow-hidden"
            style={{ backgroundColor: `${color}10` }}>
            {legion.thumb_url ?? legion.image_url ? (
              <Image
                source={{ uri: (legion.thumb_url ?? legion.image_url) as string }}
                style={{ width: 80, height: 80 }}
                resizeMode="contain"
              />
            ) : (
              <Text className="text-[40px]">🦅</Text>
            )}
          </View>

          <Text
            className="text-[22px] font-extrabold text-[#111] text-center mt-3"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {legion.name}
          </Text>

          {isUserLegion && (
            <View className="bg-laurel/15 rounded-full px-2.5 py-0.5 mt-1.5">
              <Text className="text-[11px] font-bold text-laurel">{t('legions.yourLegion')}</Text>
            </View>
          )}
        </View>

        {/* Attributes */}
        <View className="px-4 pb-4">
          <LegionAttributes description={legion.description} variant="rows" />

          {isUserLegion ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('WarRoom', { legionId: legion.id })}
              className="mt-4 rounded-[12px] py-3 items-center"
              style={{ backgroundColor: color }}>
              <Text className="text-[14px] font-bold text-white">
                ⚔️  {t('legions.enterHeadquarters')}
              </Text>
            </TouchableOpacity>
          ) : userHasLegion ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowConfirm(true)}
              className="mt-4 rounded-[12px] py-3 items-center border-2"
              style={{ borderColor: color }}>
              <Text className="text-[14px] font-bold" style={{ color }}>
                {t('legions.changeLegion')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mt-3 bg-[#f4eaea] border border-primary-500/20 rounded-[12px] px-3 py-2.5 flex-row items-start gap-2">
              <Text className="text-[14px]">⚔️</Text>
              <Text className="flex-1 text-[12px] text-[#7a1a2b] leading-[17px]">
                {t('legions.joinHint')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Modal de confirmação de troca de legião */}
      <ChangeLegionModal
        visible={showConfirm}
        legion={legion}
        totalXp={totalXp}
        userId={userId}
        onClose={() => setShowConfirm(false)}
      />
    </>
  );
}
