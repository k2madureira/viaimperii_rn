import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeNavigationProp } from '../../navigation/HomeStack';
import { FeedAuthor, FeedItem } from '../../api/feed/feedApi';
import { HashtagResult } from '../../api/search/searchApi';
import { useGlobalSearch } from '../../screens/dashboard/model/queries/useGlobalSearch';
import { SearchIcon } from '../icons';
import SearchBar from '../searchBar';

interface Props {
  visible: boolean;
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

function stripHtml(html: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Modal de busca global (§19) — usuários, hashtags e posts numa só chamada.
export default function GlobalSearchModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNavigationProp>();
  const [query, setQuery] = useState('');

  const search = useGlobalSearch(query);
  const data = search.data;
  const hasResults =
    !!data && (data.users.length > 0 || data.hashtags.length > 0 || data.posts.length > 0);
  const loading = (search.isLoading || search.isDebouncing) && search.enabled;

  const openProfile = (userId: string) => {
    onClose();
    navigation.navigate('Profile', { userId });
  };

  const openPost = (post: FeedItem) => {
    onClose();
    navigation.navigate('PostDetail', { post });
  };

  const openHashtag = (tag: string) => {
    onClose();
    navigation.navigate('HashtagFeed', { tag });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
        {/* Barra de busca + cancelar */}
        <View className="flex-row items-center px-4 py-3" style={{ gap: 10 }}>
          <View className="flex-1">
            <SearchBar value={query} onChangeText={setQuery} autoFocus />
          </View>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text className="text-[15px] font-bold text-primary-500">{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}>
          {!search.enabled && (
            <Text className="text-[13px] text-[#999] text-center mt-10">{t('search.hint')}</Text>
          )}

          {loading && (
            <View className="py-12 items-center">
              <ActivityIndicator color="#9E1B32" />
            </View>
          )}

          {search.enabled && !loading && !hasResults && (
            <Text className="text-[13px] text-[#999] text-center mt-10">
              {t('search.empty', { term: search.term })}
            </Text>
          )}

          {hasResults && (
            <View style={{ gap: 22, paddingTop: 8 }}>
              {data!.users.length > 0 && (
                <Section title={t('search.people')}>
                  {data!.users.map((u) => (
                    <UserRow key={u.id} user={u} onPress={() => openProfile(u.id)} />
                  ))}
                </Section>
              )}

              {data!.hashtags.length > 0 && (
                <Section title={t('search.hashtags')}>
                  {data!.hashtags.map((h) => (
                    <HashtagRow
                      key={h.tag}
                      item={h}
                      label={t('search.postsCount', { count: h.posts_count })}
                      onPress={() => openHashtag(h.tag)}
                    />
                  ))}
                </Section>
              )}

              {data!.posts.length > 0 && (
                <Section title={t('search.posts')}>
                  {data!.posts.map((p) => (
                    <PostRow key={p.id} item={p} onPress={() => openPost(p)} />
                  ))}
                </Section>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-[12px] font-extrabold text-[#999] uppercase mb-2">{title}</Text>
      <View className="bg-white border border-[#f0eded] rounded-[16px] overflow-hidden">{children}</View>
    </View>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  return (
    <View className="w-11 h-11 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden mr-3">
      {url ? (
        <Image source={{ uri: url }} style={{ width: 44, height: 44 }} resizeMode="cover" />
      ) : (
        <Text className="text-[13px] font-bold text-[#9E1B32]">{initials(name)}</Text>
      )}
    </View>
  );
}

function UserRow({ user, onPress }: { user: FeedAuthor; onPress: () => void }) {
  const avatarUrl = user.active_avatar?.url ?? user.image ?? null;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3 border-b border-[#f4f0f0]">
      <Avatar url={avatarUrl} name={user.name} />
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-charcoal" numberOfLines={1}>
          {user.name}
        </Text>
        {user.rank?.name && (
          <Text className="text-[12px] text-[#888]" numberOfLines={1}>
            {user.rank.name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function HashtagRow({
  item,
  label,
  onPress,
}: {
  item: HashtagResult;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3 border-b border-[#f4f0f0]">
      <View className="w-11 h-11 rounded-full bg-[#fcecef] items-center justify-center mr-3">
        <Text className="text-[18px] font-extrabold text-primary-500">#</Text>
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-charcoal" numberOfLines={1}>
          #{item.tag}
        </Text>
        <Text className="text-[12px] text-[#888]">{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function PostRow({ item, onPress }: { item: FeedItem; onPress: () => void }) {
  const snippet = stripHtml(item.body);
  const avatarUrl = item.author.active_avatar?.url ?? item.author.image ?? null;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3 border-b border-[#f4f0f0]">
      <Avatar url={avatarUrl} name={item.author.name} />
      <View className="flex-1">
        <Text className="text-[13px] font-bold text-charcoal" numberOfLines={1}>
          {item.author.name}
        </Text>
        <Text className="text-[13px] text-[#666]" numberOfLines={2}>
          {snippet || '—'}
        </Text>
      </View>
      <SearchIcon size={16} color="#c9c9c9" />
    </TouchableOpacity>
  );
}
