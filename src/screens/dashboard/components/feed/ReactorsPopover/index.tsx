import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Reactor, ReactionType } from '../../../../../api/feed/feedApi';
import { useReactors } from '../../../model/queries/useReactors';
import AnchoredPopover, { Anchor } from '../AnchoredPopover';
import { REACTIONS, ReactionGlyph } from '../FeedReactions';

interface Props {
  eventId: number;
  anchor: Anchor | null;
  onClose: () => void;
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function Chip({
  active,
  onPress,
  label,
  glyph,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  glyph?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${
        active ? 'bg-[#f1e3e6]' : 'bg-[#f7f4f4]'
      }`}>
      {glyph}
      <Text className="text-[11px] font-bold" style={{ color: active ? '#9E1B32' : '#777' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ReactorRow({ reactor }: { reactor: Reactor }) {
  const u = reactor.user;
  const avatarUrl = u.active_avatar?.url ?? u.image ?? null;
  return (
    <View className="flex-row items-center px-3 py-2">
      <View className="w-8 h-8 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden mr-2.5">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 32, height: 32 }} resizeMode="cover" />
        ) : (
          <Text className="text-[11px] font-bold" style={{ color: '#9E1B32' }}>
            {initials(u.name)}
          </Text>
        )}
      </View>
      <View className="flex-1">
        <Text className="text-[13px] font-bold text-charcoal" numberOfLines={1}>
          {u.name}
        </Text>
        {u.rank?.name ? (
          <Text className="text-[11px] text-[#999]" numberOfLines={1}>
            {u.rank.name}
          </Text>
        ) : null}
      </View>
      <ReactionGlyph type={reactor.type} size={16} />
    </View>
  );
}

/**
 * Popover (dropdown/dropup) que lista os usuários que reagiram ao post e a
 * reação de cada um, com chips de filtro por tipo. Ancorado ao "cluster" de
 * reações; abre para cima ou para baixo conforme a posição na tela.
 */
export default function ReactorsPopover({ eventId, anchor, onClose }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ReactionType | null>(null);
  const open = anchor != null;
  const q = useReactors(open ? eventId : null, filter, open);

  useEffect(() => {
    if (!open) setFilter(null);
  }, [open]);

  const first = q.data?.pages?.[0];
  const total = first?.total ?? 0;
  const byType = first?.by_type ?? {};
  const reactors = (q.data?.pages ?? []).flatMap((p) => p.items);
  const present = REACTIONS.filter((r) => (byType[r.type] ?? 0) > 0);

  return (
    <AnchoredPopover anchor={anchor} onClose={onClose} width={250} align="left">
      {/* Filtros por tipo */}
      <View className="flex-row items-center gap-1.5 px-3 pt-3 pb-2 border-b border-[#f3eeee]">
        <Chip
          active={filter === null}
          onPress={() => setFilter(null)}
          label={`${t('feed.allReactions')} ${total}`}
        />
        {present.map((r) => (
          <Chip
            key={r.type}
            active={filter === r.type}
            onPress={() => setFilter(r.type)}
            glyph={<ReactionGlyph type={r.type} size={13} />}
            label={String(byType[r.type] ?? 0)}
          />
        ))}
      </View>

      {/* Lista de quem reagiu */}
      <View style={{ maxHeight: 260 }}>
        {q.isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#8B1A2B" />
          </View>
        ) : (
          <FlatList
            data={reactors}
            keyExtractor={(r, i) => `${r.user.id}-${i}`}
            renderItem={({ item: r }) => <ReactorRow reactor={r} />}
            keyboardShouldPersistTaps="handled"
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
            }}
            ListEmptyComponent={
              <View className="py-6 items-center">
                <Text className="text-[12px] text-[#999]">{t('feed.noReactions')}</Text>
              </View>
            }
            ListFooterComponent={
              q.isFetchingNextPage ? (
                <View className="py-2 items-center">
                  <ActivityIndicator size="small" color="#8B1A2B" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </AnchoredPopover>
  );
}
