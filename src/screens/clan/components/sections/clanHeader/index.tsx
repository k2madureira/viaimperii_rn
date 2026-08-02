import React from 'react';
import { ActivityIndicator, Image, Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ClanDetail } from '../../../../../api/clan';
import { StandardIcon } from '../../../../../components/icons';
import { clanDivisionColor, clanDivisionSlug } from '../../../../../constants/clans';

interface Props {
  clan: ClanDetail;
  // Marechal pode trocar o emblema (torna a insígnia tocável + mostra o gatilho).
  canEditEmblem?: boolean;
  emblemUploading?: boolean;
  onEditEmblem?: () => void;
}

// Cabeçalho do clã: emblema, nome, tag, nível/capacidade e a divisão do viewer.
export default function ClanHeader({ clan, canEditEmblem, emblemUploading, onEditEmblem }: Props) {
  const { t } = useTranslation();

  const EmblemWrapper: any = canEditEmblem ? TouchableOpacity : View;

  return (
    <View className="bg-laurel rounded-[20px] p-5">
      <View className="flex-row items-center">
        {/* Wrapper externo SEM overflow-hidden — o clip circular fica no View
            interno, senão ele cortaria o badge de edição no canto. */}
        <EmblemWrapper
          className="w-20 h-20 mr-4"
          {...(canEditEmblem
            ? {
                onPress: onEditEmblem,
                activeOpacity: 0.8,
                disabled: emblemUploading,
                accessibilityLabel: t('clan.emblem.change'),
              }
            : {})}>
          <View className="w-20 h-20 rounded-full bg-white/15 items-center justify-center overflow-hidden">
            {clan.emblem_url ? (
              <Image
                source={{ uri: clan.emblem_url }}
                style={{ width: 64, height: 64 }}
                resizeMode="contain"
              />
            ) : (
              <StandardIcon size={38} color="#fff" />
            )}

            {/* Overlay de progresso durante o upload. */}
            {emblemUploading ? (
              <View className="absolute inset-0 bg-black/40 items-center justify-center">
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : null}
          </View>

          {/* Gatilho de câmera (canto) — só para o marechal. Fora do clip. */}
          {canEditEmblem && !emblemUploading ? (
            <View className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-700 items-center justify-center border border-white">
              <Text className="text-[11px] text-white leading-none">✎</Text>
            </View>
          ) : null}
        </EmblemWrapper>

        <View className="flex-1">
          {clan.tag ? (
            <Text className="text-[11px] font-bold text-white/70 tracking-[2px] uppercase">
              [{clan.tag}]
            </Text>
          ) : null}
          <Text
            className="text-[24px] font-extrabold text-white"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            numberOfLines={2}>
            {clan.name}
          </Text>
          {clan.my_rank_level ? (
            <View className="flex-row items-center mt-1.5">
              <View className="px-2.5 py-0.5 rounded-full bg-white/20">
                <Text className="text-[11px] font-bold text-white">
                  {t(`clan.divisions.${clanDivisionSlug(clan.my_rank_level)}`)}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>

      {clan.description ? (
        <Text className="text-[13px] text-white/85 leading-[19px] mt-4">{clan.description}</Text>
      ) : null}

      <View className="flex-row mt-4 gap-3">
        <View className="flex-1 bg-white/10 rounded-[14px] px-3 py-2.5">
          <Text className="text-[18px] font-extrabold text-white">
            {clan.members_count}/{clan.member_cap}
          </Text>
          <Text className="text-[11px] text-white/70 mt-0.5">{t('clan.header.members')}</Text>
        </View>
        <View className="flex-1 bg-white/10 rounded-[14px] px-3 py-2.5">
          <Text className="text-[18px] font-extrabold text-white">
            {t('clan.header.levelValue', { level: clan.level })}
          </Text>
          <Text className="text-[11px] text-white/70 mt-0.5">{t('clan.header.capacity')}</Text>
        </View>
      </View>
    </View>
  );
}
