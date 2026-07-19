import React from 'react';
import { Image, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { DenariusCoin, MedalIcon } from '../../../../../components/icons';
import { LeaderboardItem } from '../../../../../api/leaderboards/leaderboardsApi';

// Linha do placar: posição (medalha nos 3 primeiros), avatar, nome, patente
// (mini) e XP. Pódio 1–3 recebe destaque de fundo + badge de prêmio em denarii.
interface Props {
  item: LeaderboardItem;
  prizeDenarii?: number; // ao vivo: prizes[position] (denarii cru)
  prizeDisplay?: string; // histórico: prize_amount_display (já formatado)
  highlight?: boolean; // linha do próprio viewer dentro da lista
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

const PODIUM_BG: Record<number, string> = {
  1: '#FFF8E6',
  2: '#F4F5F7',
  3: '#FBEFE4',
};

export default function LeaderboardRow({ item, prizeDenarii, prizeDisplay, highlight }: Props) {
  const { t } = useTranslation();
  const { position, xp, user } = item;
  const isPodium = position >= 1 && position <= 3;
  const avatarUrl = user.active_avatar?.url ?? user.image ?? null;
  const bg = highlight ? '#FBF2F2' : isPodium ? PODIUM_BG[position] : '#fff';

  return (
    <View
      className="flex-row items-center rounded-[14px] px-3 py-2.5 border border-[#f0eded]"
      style={{ backgroundColor: bg, gap: 10 }}>
      {/* Posição / medalha */}
      <View className="w-8 items-center">
        {isPodium ? (
          <MedalIcon place={position as 1 | 2 | 3} size={24} />
        ) : (
          <Text className="text-[13px] font-extrabold text-[#8a7f7f]">{position}</Text>
        )}
      </View>

      {/* Avatar */}
      <View className="w-9 h-9 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 36, height: 36 }} resizeMode="cover" />
        ) : (
          <Text className="text-[12px] font-bold text-primary-500">{initials(user.name)}</Text>
        )}
      </View>

      {/* Nome + patente */}
      <View className="flex-1">
        <Text className="text-[13px] font-bold text-charcoal" numberOfLines={1}>
          {user.name}
        </Text>
        {user.rank?.name ? (
          <Text className="text-[10.5px] text-[#999]" numberOfLines={1}>
            {user.rank.name}
          </Text>
        ) : null}
      </View>

      {/* XP + prêmio */}
      <View className="items-end" style={{ gap: 3 }}>
        <Text className="text-[12.5px] font-extrabold text-primary-500">
          {t('leaderboards.xp', { xp })}
        </Text>
        {prizeDisplay ? (
          <View className="flex-row items-center" style={{ gap: 3 }}>
            <DenariusCoin size={13} />
            <Text className="text-[10.5px] font-bold text-[#8a7f7f]">{prizeDisplay}</Text>
          </View>
        ) : prizeDenarii != null ? (
          <View className="flex-row items-center" style={{ gap: 3 }}>
            <DenariusCoin size={13} />
            <Text className="text-[10.5px] font-bold text-[#8a7f7f]">{prizeDenarii}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
