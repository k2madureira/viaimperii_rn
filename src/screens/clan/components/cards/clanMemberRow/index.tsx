import React from 'react';
import { Image, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ClanMemberItem } from '../../../../../api/clan';
import { clanDivisionColor, clanDivisionSlug } from '../../../../../constants/clans';

interface Props {
  member: ClanMemberItem;
}

// Linha de membro do clã: avatar + nome + selo de divisão.
export default function ClanMemberRow({ member }: Props) {
  const { t } = useTranslation();
  const aa = member.user.active_avatar;
  const avatarUrl = aa?.url ?? member.user.image ?? null;
  const color = clanDivisionColor(member.rank_level);

  return (
    <View className="flex-row items-center py-2.5">
      <View className="w-10 h-10 rounded-full bg-[#f4eaea] items-center justify-center overflow-hidden mr-3">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 40, height: 40 }} resizeMode="cover" />
        ) : (
          <Text className="text-[16px] font-bold text-[#9E1B32]">
            {member.user.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-[14px] font-semibold text-[#111]" numberOfLines={1}>
          {member.user.name}
        </Text>
        {member.user.rank?.name ? (
          <Text className="text-[11px] text-[#888]" numberOfLines={1}>
            {member.user.rank.name}
          </Text>
        ) : null}
      </View>

      <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}1A` }}>
        <Text className="text-[11px] font-bold" style={{ color }}>
          {t(`clan.divisions.${clanDivisionSlug(member.rank_level)}`)}
        </Text>
      </View>
    </View>
  );
}
