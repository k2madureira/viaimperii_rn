import React, { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FriendItem } from '../../../../../api/friendship';
import { useFriends } from '../../../model/queries/useFriends';
import { useUnfriend } from '../../../model/mutations/useUnfriend';
import { useBlockUser } from '../../../model/mutations/useBlockUser';
import FriendManageRow from '../../cards/friendManageRow';
import AddFriendSection from '../addFriendSection';
import EmptyBox from '../../feedback/emptyBox';
import ErrorState from '../../feedback/errorState';
import FriendsSkeleton from '../../skeletons/friendsSkeleton';
import ConfirmModal from '../../modals/confirmModal';

interface Props {
  bottomInset: number;
  currentUserId?: string;
  onOpenProfile: (userId: string) => void;
}

type PendingAction = { kind: 'unfriend' | 'block'; item: FriendItem } | null;

// Aba Amigos (gestão): buscar/adicionar por @handle + roster com dropdown de ações
// (ver perfil / desfazer / bloquear). Query e mutations de gestão vivem aqui.
export default function AmigosSection({ bottomInset, currentUserId, onOpenProfile }: Props) {
  const { t } = useTranslation();
  const friendsQuery = useFriends();
  const unfriendM = useUnfriend();
  const blockM = useBlockUser();
  const [action, setAction] = useState<PendingAction>(null);

  const items = friendsQuery.data?.items ?? [];
  const pending = unfriendM.isPending || blockM.isPending;

  const confirm = () => {
    if (!action) return;
    const userId = action.item.user.id;
    const onDone = () => setAction(null);
    if (action.kind === 'unfriend') unfriendM.mutate(userId, { onSuccess: onDone, onError: onDone });
    else blockM.mutate(userId, { onSuccess: onDone, onError: onDone });
  };

  const addSection = <AddFriendSection currentUserId={currentUserId} />;

  if (friendsQuery.isLoading) {
    return (
      <View className="flex-1 px-5 pt-4">
        {addSection}
        <View className="mt-4">
          <FriendsSkeleton />
        </View>
      </View>
    );
  }

  if (friendsQuery.isError) {
    return (
      <View className="flex-1 px-5 pt-4">
        {addSection}
        <ErrorState
          message={(friendsQuery.error as Error)?.message}
          onRetry={() => friendsQuery.refetch()}
        />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.friendship_id)}
        ListHeaderComponent={<View style={{ paddingBottom: 8 }}>{addSection}</View>}
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
        renderItem={({ item }) => (
          <FriendManageRow
            item={item}
            onOpenProfile={onOpenProfile}
            onUnfriend={(it) => setAction({ kind: 'unfriend', item: it })}
            onBlock={(it) => setAction({ kind: 'block', item: it })}
          />
        )}
      />

      <ConfirmModal
        visible={action != null}
        title={
          action?.kind === 'block'
            ? t('friends.confirm.blockTitle')
            : t('friends.confirm.unfriendTitle')
        }
        message={
          action?.kind === 'block'
            ? t('friends.confirm.blockMessage', { name: action?.item.user.name ?? '' })
            : t('friends.confirm.unfriendMessage', { name: action?.item.user.name ?? '' })
        }
        confirmLabel={
          action?.kind === 'block' ? t('friends.actions.block') : t('friends.actions.unfriend')
        }
        destructive={action?.kind === 'block'}
        pending={pending}
        onConfirm={confirm}
        onClose={() => setAction(null)}
      />
    </>
  );
}
