import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { FeedItem } from '../../../../../api/feed/feedApi';
import { Legion } from '../../../../../api/legions/legionsApi';
import { PrimusPilusEmblem } from '../../../../../components/icons';
import { useReactFeed } from '../../../model/mutations/useReactFeed';
import { FeedCard } from '../../feed';

interface Props {
  items: FeedItem[];
  currentUserId?: string | null;
  legions?: Legion[];
  header: React.ReactElement;
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onEndReached: () => void;
  bottomInset: number;
  onOpenComments: (item: FeedItem) => void;
}

// Timeline social da home. O cabeçalho da tela vai no ListHeaderComponent.
export default function HomeFeed({
  items,
  currentUserId,
  legions,
  header,
  isLoading,
  refreshing,
  onRefresh,
  hasNextPage,
  isFetchingNextPage,
  onEndReached,
  bottomInset,
  onOpenComments,
}: Props) {
  const { t } = useTranslation();
  const reactM = useReactFeed();

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={header}
      ListHeaderComponentStyle={{ marginBottom: 20 }}
      renderItem={({ item }) => (
        <FeedCard
          item={item}
          currentUserId={currentUserId}
          legions={legions}
          onReact={(eventId, type, currentMine) => reactM.mutate({ eventId, type, currentMine })}
          onOpenComments={onOpenComments}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      contentContainerStyle={{ paddingHorizontal: 3, paddingTop: 20, paddingBottom: bottomInset + 24 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9E1B32" />
      }
      // Dispara o carregamento incremental (+5) quando o usuário se aproxima
      // do fim — ~1 tela antes do último post.
      onEndReachedThreshold={0.6}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) onEndReached();
      }}
      ListEmptyComponent={
        isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator color="#8B1A2B" />
          </View>
        ) : (
          <View className="bg-white border border-[#f0eded] rounded-[18px] py-10 items-center px-6 mt-2">
            <PrimusPilusEmblem size={56} />
            <Text className="text-[14px] font-bold text-charcoal mt-3 text-center">
              {t('feed.emptyTitle')}
            </Text>
            <Text className="text-[12px] text-[#999] mt-1 text-center">{t('feed.emptyBody')}</Text>
          </View>
        )
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="py-4 items-center">
            <ActivityIndicator color="#8B1A2B" size="small" />
          </View>
        ) : null
      }
    />
  );
}
