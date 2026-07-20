import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { viaimperiiApi } from '../../../../../api';
import { FeedAuthor } from '../../../../../api/feed';

interface Props {
  query: string | null; // termo ativo (sem o @); null = escondido
  onSelect: (user: FeedAuthor) => void;
}

function initials(name?: string | null) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

// Lista de sugestões de @menção. Debounce + busca por username (mín. 2 chars).
// Como o username não é único, mostra a patente para ajudar a distinguir homônimos.
export default function MentionSuggestions({ query, onSelect }: Props) {
  const [items, setItems] = useState<FeedAuthor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query?.trim() ?? '';
    if (q.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await viaimperiiApi.feed.searchUsers(q, 8);
        if (alive) setItems(res);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [query]);

  if (query == null || query.trim().length < 2) return null;
  if (!loading && items.length === 0) return null;

  return (
    <View className="border border-[#eee] rounded-[12px] mt-2 overflow-hidden bg-white">
      {loading && items.length === 0 ? (
        <View className="py-3 items-center">
          <ActivityIndicator size="small" color="#9E1B32" />
        </View>
      ) : (
        items.map((u, i) => {
          const raw = u.active_avatar?.url || u.image || null;
          const avatarUrl = raw && raw.trim() ? raw : null;
          return (
            <TouchableOpacity
              key={`${u.id}-${i}`}
              onPress={() => onSelect(u)}
              activeOpacity={0.7}
              className={`flex-row items-center px-3 py-2.5 ${i > 0 ? 'border-t border-[#f3eeee]' : ''}`}>
              <View className="w-8 h-8 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden mr-2.5">
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={{ width: 32, height: 32 }} resizeMode="cover" />
                ) : (
                  <Text className="text-[11px] font-bold text-primary-500">{initials(u.name)}</Text>
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
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}
