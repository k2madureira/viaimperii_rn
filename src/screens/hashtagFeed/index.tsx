import React, { useState } from 'react';
import ScreenContainer from '../../components/screenContainer';
import { ActivityIndicator, FlatList, Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../components/text';
import { useTranslation } from 'react-i18next';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { FeedItem } from '../../api/feed/feedApi';
import { HomeNavigationProp, HomeStackParamList } from '../../navigation/HomeStack';
import { useAuth } from '../../contexts/AuthContext';
import { CommentsModal, FeedCard } from '../dashboard/components/feed';
import { useReactFeed } from '../dashboard/model/mutations/useReactFeed';
import { useLegions } from '../missions/model/queries/useLegions';
import { useHashtagFeed } from './model/queries/useHashtagFeed';

type HashtagRoute = RouteProp<HomeStackParamList, 'HashtagFeed'>;

export default function HashtagFeedScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  const { tag } = useRoute<HashtagRoute>().params;
  const { user } = useAuth();

  const feedQuery = useHashtagFeed(tag);
  const reactM = useReactFeed();
  const legionsQuery = useLegions();
  const [commentsItem, setCommentsItem] = useState<FeedItem | null>(null);

  const items = (feedQuery.data?.pages ?? []).flatMap((p) => p.items);

  return (
    <ScreenContainer>
      <Navbar />

      {/* Cabeçalho: voltar + #hashtag */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#f0f0f0]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="pr-3"
          accessibilityLabel={t('common.back')}>
          <Text className="text-[24px] text-[#333] leading-none">‹</Text>
        </TouchableOpacity>
        <Text
          className="text-[16px] font-extrabold text-primary-500"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
          numberOfLines={1}>
          #{tag.replace(/^#/, '')}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            currentUserId={user?.user_id}
            legions={legionsQuery.data}
            onReact={(eventId, type, currentMine) =>
              reactM.mutate({ eventId, type, currentMine })
            }
            onOpenComments={setCommentsItem}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{
          paddingHorizontal: 3,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.6}
        onEndReached={() => {
          if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
            feedQuery.fetchNextPage();
          }
        }}
        ListEmptyComponent={
          feedQuery.isLoading ? (
            <View className="py-16 items-center">
              <ActivityIndicator color="#8B1A2B" />
            </View>
          ) : (
            <View className="bg-white border border-[#f0eded] rounded-[18px] py-12 items-center px-6 mt-2 mx-3">
              <Text className="text-[26px] mb-2">#️⃣</Text>
              <Text className="text-[13px] text-[#999] text-center">
                {t('hashtagFeed.empty', { tag: tag.replace(/^#/, '') })}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          feedQuery.isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#8B1A2B" size="small" />
            </View>
          ) : null
        }
      />

      <CommentsModal item={commentsItem} onClose={() => setCommentsItem(null)} />
    </ScreenContainer>
  );
}
