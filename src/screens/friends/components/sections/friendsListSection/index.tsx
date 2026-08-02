import React, { useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ConversationItem } from '../../../../../api/chat';
import { FriendItem } from '../../../../../api/friendship';
import { HomeNavigationProp } from '../../../../../navigation/HomeStack';
import { useFriends } from '../../../model/queries/useFriends';
import { useConversations } from '../../../model/queries/useConversations';
import FriendCard from '../../cards/friendCard';
import EmptyBox from '../../feedback/emptyBox';
import ErrorState from '../../feedback/errorState';
import FriendsSkeleton from '../../skeletons/friendsSkeleton';

interface Props {
  bottomInset: number;
}

// Aba Chat (inbox): tocar num amigo abre a tela dedicada da conversa (estilo
// Instagram). Cruza com o inbox para preview da última mensagem e não-lidas.
export default function FriendsListSection({ bottomInset }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  const friendsQuery = useFriends();
  const conversationsQuery = useConversations();

  const items = friendsQuery.data?.items ?? [];

  const openChat = (friend: FriendItem) =>
    navigation.navigate('DmConversation', {
      userId: friend.user.id,
      name: friend.user.name,
      avatarUrl: friend.user.active_avatar?.url ?? friend.user.image ?? null,
      presenceStatus: friend.presence_status,
    });

  // Mapa peerId(uuid) → conversa, para preview + contador de não-lidas por amigo.
  const convByPeer = useMemo(() => {
    const map = new Map<string, ConversationItem>();
    for (const c of conversationsQuery.data?.items ?? []) {
      if (c.type === 'dm' && c.peer) map.set(c.peer.id, c);
    }
    return map;
  }, [conversationsQuery.data]);

  if (friendsQuery.isLoading) {
    return (
      <View className="flex-1 px-5 pt-4">
        <FriendsSkeleton />
      </View>
    );
  }

  if (friendsQuery.isError) {
    return (
      <ErrorState
        message={(friendsQuery.error as Error)?.message}
        onRetry={() => friendsQuery.refetch()}
      />
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.friendship_id)}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: bottomInset + 24,
        gap: 12,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={friendsQuery.isFetching}
          onRefresh={() => friendsQuery.refetch()}
          tintColor="#9E1B32"
        />
      }
      ListEmptyComponent={
        <EmptyBox
          title={t('friends.empty.friendsTitle')}
          subtitle={t('friends.empty.friendsSubtitle')}
        />
      }
      renderItem={({ item }) => {
        const conv = convByPeer.get(item.user.id);
        return (
          <FriendCard
            item={item}
            onPress={() => openChat(item)}
            unreadCount={conv?.unread_count ?? 0}
            lastPreview={conv?.last_message?.body ?? null}
          />
        );
      }}
    />
  );
}
