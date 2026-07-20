import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { LegionLeader } from '../../../../../api/legionTreasury';

interface Props {
  leader: LegionLeader;
  color: string;
  onPress: () => void;
}

// Selo do Centurião (líder DERIVADO do XP, não eleito). Tocar abre o "por quê" —
// é o gancho de aspiração: o membro vê a que distância está de liderar.
export default function CenturionCard({ leader, color, onPress }: Props) {
  const { t } = useTranslation();

  const avatar = leader.user.active_avatar?.url ?? leader.user.image;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={t('legions.treasury.centurionWhy')}
      className="flex-row items-center gap-3 bg-[#faf7f7] rounded-[12px] px-3 py-2.5">
      <View
        className="w-9 h-9 rounded-full items-center justify-center overflow-hidden"
        style={{ backgroundColor: `${color}14` }}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={{ width: 36, height: 36 }} resizeMode="cover" />
        ) : (
          <Text className="text-[16px]">🎖️</Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-[10.5px] font-bold text-[#999] tracking-[1.2px] uppercase">
          {t('legions.treasury.centurion')}
        </Text>
        <Text className="text-[13px] font-extrabold text-[#333]" numberOfLines={1}>
          {leader.user.name}
        </Text>
      </View>

      <Text className="text-[16px] text-[#ccc]">›</Text>
    </TouchableOpacity>
  );
}
