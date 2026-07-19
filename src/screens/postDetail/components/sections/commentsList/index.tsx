import React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { useFeedComments } from '../../../../dashboard/model/queries/useFeedComments';
import CommentRow from '../../cards/commentRow';

interface Props {
  postId: number;
  header: React.ReactElement;
}

// Lista de comentários paginada (keyset). O post fica no ListHeaderComponent.
export default function CommentsList({ postId, header }: Props) {
  const { t } = useTranslation();
  const commentsQuery = useFeedComments(postId, true);
  const comments = (commentsQuery.data?.pages ?? []).flatMap((p) => p.items);

  return (
    <FlatList
      data={comments}
      keyExtractor={(c) => String(c.id)}
      ListHeaderComponent={header}
      renderItem={({ item: c }) => <CommentRow comment={c} />}
      contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      // Mesma lógica do feed: dispara +5 quando se aproxima do fim.
      onEndReachedThreshold={0.6}
      onEndReached={() => {
        if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
          commentsQuery.fetchNextPage();
        }
      }}
      ListEmptyComponent={
        commentsQuery.isLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color="#8B1A2B" />
          </View>
        ) : (
          <View className="py-8 items-center px-6">
            <Text className="text-[13px] text-[#999] text-center">{t('feed.noComments')}</Text>
          </View>
        )
      }
      ListFooterComponent={
        commentsQuery.isFetchingNextPage ? (
          <View className="py-3 items-center">
            <ActivityIndicator color="#8B1A2B" size="small" />
          </View>
        ) : null
      }
    />
  );
}
