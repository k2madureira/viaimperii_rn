import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ClanSummary } from '../../../../../api/clan';
import { StandardIcon } from '../../../../../components/icons';

interface Props {
  clan: ClanSummary;
  onPress: () => void;
}

// Linha do diretório de clãs: emblema, nome/tag, contagem de membros e nível.
export default function ClanRow({ clan, onPress }: Props) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white rounded-[16px] p-4 border border-[#f0eded]"
      activeOpacity={0.85}
      onPress={onPress}>
      <View className="w-14 h-14 rounded-full bg-[#f4eaea] items-center justify-center overflow-hidden mr-3.5">
        {clan.emblem_url ? (
          <Image source={{ uri: clan.emblem_url }} style={{ width: 44, height: 44 }} resizeMode="contain" />
        ) : (
          <StandardIcon size={26} color="#9E1B32" />
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center">
          {clan.tag ? (
            <Text className="text-[11px] font-bold text-[#9E1B32] mr-1.5">[{clan.tag}]</Text>
          ) : null}
          <Text className="text-[15px] font-bold text-[#111] flex-1" numberOfLines={1}>
            {clan.name}
          </Text>
        </View>
        <Text className="text-[12px] text-[#888] mt-0.5">
          {t('clan.directory.rowMeta', {
            members: clan.members_count,
            cap: clan.member_cap,
            level: clan.level,
          })}
        </Text>
      </View>

      <Text className="text-[#ccc] text-[22px] ml-2">›</Text>
    </TouchableOpacity>
  );
}
