import React, { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RequestDirection } from '../../../../../api/friendship';
import { useFriendRequests } from '../../../model/queries/useFriendRequests';
import { useRespondFriendRequest } from '../../../model/mutations/useRespondFriendRequest';
import RequestCard from '../../cards/requestCard';
import FriendsTab from '../../buttons/friendsTab';
import EmptyBox from '../../feedback/emptyBox';
import ErrorState from '../../feedback/errorState';
import FriendsSkeleton from '../../skeletons/friendsSkeleton';

interface Props {
  bottomInset: number;
  onOpenProfile: (userId: string) => void;
}

// Pedidos pendentes com sub-abas recebidos/enviados. Query e mutation vivem aqui.
export default function RequestsListSection({ bottomInset, onOpenProfile }: Props) {
  const { t } = useTranslation();
  const [direction, setDirection] = useState<RequestDirection>('incoming');
  const requestsQuery = useFriendRequests(direction);
  const respondM = useRespondFriendRequest();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const items = requestsQuery.data?.items ?? [];

  const respond = (friendshipId: number, accept: boolean) => {
    if (respondM.isPending) return;
    setPendingId(friendshipId);
    respondM.mutate({ friendshipId, accept }, { onSettled: () => setPendingId(null) });
  };

  const subTabs = (
    <View className="flex-row mx-5 mt-3 mb-1 p-1 rounded-[14px] bg-[#f4eaea]">
      <FriendsTab
        label={t('friends.requests.incoming')}
        active={direction === 'incoming'}
        onPress={() => setDirection('incoming')}
      />
      <FriendsTab
        label={t('friends.requests.outgoing')}
        active={direction === 'outgoing'}
        onPress={() => setDirection('outgoing')}
      />
    </View>
  );

  return (
    <View className="flex-1">
      {subTabs}

      {requestsQuery.isLoading ? (
        <View className="px-5 pt-4">
          <FriendsSkeleton />
        </View>
      ) : requestsQuery.isError ? (
        <ErrorState
          message={(requestsQuery.error as Error)?.message}
          onRetry={() => requestsQuery.refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: bottomInset + 24,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={requestsQuery.isFetching}
              onRefresh={() => requestsQuery.refetch()}
              tintColor="#9E1B32"
            />
          }
          ListEmptyComponent={
            <EmptyBox
              title={
                direction === 'incoming'
                  ? t('friends.empty.incomingTitle')
                  : t('friends.empty.outgoingTitle')
              }
              subtitle={
                direction === 'incoming'
                  ? t('friends.empty.incomingSubtitle')
                  : t('friends.empty.outgoingSubtitle')
              }
            />
          }
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              onOpenProfile={onOpenProfile}
              onAccept={(it) => respond(it.id, true)}
              onDecline={(it) => respond(it.id, false)}
              pending={pendingId === item.id}
            />
          )}
        />
      )}
    </View>
  );
}
