import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../../components';
import { FeedComment, FeedItem, ReactionType } from '../../api/feed/feedApi';
import { parseBackendDate } from '../../utils/date';
import { HomeNavigationProp, HomeStackParamList } from '../../navigation/HomeStack';
import { useAuth } from '../../contexts/AuthContext';
import { useLegions } from '../missions/model/queries/useLegions';
import { FeedCard } from '../dashboard/components/feed';
import { useFeedComments } from '../dashboard/model/queries/useFeedComments';
import { useFeedEvent } from '../dashboard/model/queries/useFeedEvent';
import { useCreateComment } from '../dashboard/model/mutations/useCreateComment';
import { useReactFeed } from '../dashboard/model/mutations/useReactFeed';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function CommentRow({ comment }: { comment: FeedComment }) {
  const avatarUrl = comment.author.active_avatar?.url ?? comment.author.image ?? null;
  const d = parseBackendDate(comment.created_at);
  const time = d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
  return (
    <View className={`flex-row ${comment.parent_id ? 'pl-10' : ''} px-4 py-2`}>
      <View className="w-8 h-8 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden mr-2.5">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 32, height: 32 }} resizeMode="cover" />
        ) : (
          <Text className="text-[11px] font-bold text-primary-500">{initials(comment.author.name)}</Text>
        )}
      </View>
      <View className="flex-1 bg-[#f7f4f4] rounded-[12px] px-3 py-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-extrabold text-charcoal" numberOfLines={1}>
            {comment.author.name}
          </Text>
          <Text className="text-[10px] text-[#aaa] ml-2">{time}</Text>
        </View>
        <Text className="text-[13px] text-[#333] leading-[18px] mt-0.5">{comment.body}</Text>
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  const route = useRoute<RouteProp<HomeStackParamList, 'PostDetail'>>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // O item da busca é usado como dado inicial; o hook refaz em segundo plano
  // para trazer reações/contagem atualizadas do servidor.
  const postQuery = useFeedEvent(route.params.post.id, route.params.post);
  const post = postQuery.data ?? route.params.post;

  const legionsQuery = useLegions();
  const commentsQuery = useFeedComments(post.id, true);
  const createM = useCreateComment();
  const reactM = useReactFeed();

  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');

  const comments = (commentsQuery.data?.pages ?? []).flatMap((p) => p.items);

  // Atualiza otimistamente o cache deste post (o cache do feed pode não conter
  // este item, já que veio da busca).
  const patchPost = (patch: (p: FeedItem) => FeedItem) =>
    queryClient.setQueryData<FeedItem>(['feed-event', post.id], (p) => (p ? patch(p) : p));

  const onReact = (eventId: number, type: ReactionType, currentMine: ReactionType | null) => {
    reactM.mutate({ eventId, type, currentMine });
    patchPost((p) => {
      const removing = currentMine === type;
      const by = { ...p.reactions.by_type };
      if (currentMine) by[currentMine] = Math.max(0, (by[currentMine] ?? 0) - 1);
      if (!removing) by[type] = (by[type] ?? 0) + 1;
      const total = Object.values(by).reduce((s, n) => s + (n ?? 0), 0);
      return { ...p, reactions: { total, by_type: by, mine: removing ? null : type } };
    });
  };

  const submit = () => {
    const body = text.trim();
    if (!body) return;
    createM.mutate(
      { eventId: post.id, body },
      {
        onSuccess: () => {
          setText('');
          patchPost((p) => ({ ...p, comments_count: p.comments_count + 1 }));
        },
      },
    );
  };

  const Header = (
    <View>
      {/* Voltar (conteúdo, não substitui a Navbar padrão) */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
        className="flex-row items-center px-4 py-3">
        <Text className="text-[18px] text-primary-500 mr-1">‹</Text>
        <Text className="text-[14px] font-bold text-primary-500">{t('common.back')}</Text>
      </TouchableOpacity>

      {/* Post */}
      <View className="px-3">
        <FeedCard
          item={post}
          currentUserId={user?.user_id}
          legions={legionsQuery.data}
          onReact={onReact}
          onOpenComments={() => inputRef.current?.focus()}
        />
      </View>

      {/* Título da seção de comentários */}
      <Text className="text-[13px] font-extrabold text-[#999] uppercase px-4 mt-5 mb-1">
        {t('feed.commentsTitle')}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}>
        <FlatList
          data={comments}
          keyExtractor={(c) => String(c.id)}
          ListHeaderComponent={Header}
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

        {/* Campo de novo comentário */}
        <View
          className="flex-row items-end gap-2 px-4 pt-2 border-t border-[#f0eded] bg-white"
          style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={t('feed.commentPlaceholder')}
            placeholderTextColor="#aaa"
            multiline
            maxLength={1000}
            className="flex-1 bg-[#f7f4f4] rounded-[16px] px-3.5 py-2.5 text-[14px] text-charcoal max-h-[100px]"
            style={{ textAlignVertical: 'top' }}
          />
          <TouchableOpacity
            onPress={submit}
            disabled={!text.trim() || createM.isPending}
            activeOpacity={0.85}
            className={`rounded-full w-11 h-11 items-center justify-center ${
              text.trim() && !createM.isPending ? 'bg-primary-500' : 'bg-primary-500/40'
            }`}>
            {createM.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-[16px] text-white">➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
