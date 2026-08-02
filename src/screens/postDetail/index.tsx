import { RouteProp, useRoute } from '@react-navigation/native';
import ScreenContainer from '../../components/screenContainer';
import React, { useRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../components/text';
import type { TextInputRef } from '../../components/textInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../../components';
import { FeedItem } from '../../api/feed';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { useAuth } from '../../contexts/AuthContext';
import { useFeedEvent } from '../dashboard/model/queries/useFeedEvent';
import { CommentComposer, CommentsList, PostDetailHeader } from './components/sections';

export default function PostDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<HomeStackParamList, 'PostDetail'>>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Navegação interna passa o objeto `post` (render instantâneo); o deep-link passa
  // só `postId` (string na URL) — aí busca por id.
  const paramPost = route.params.post;
  const id = paramPost?.id ?? Number(route.params.postId);

  // O item passado é usado como dado inicial; o hook refaz em segundo plano
  // para trazer reações/contagem atualizadas do servidor.
  const postQuery = useFeedEvent(Number.isFinite(id) ? id : 0, paramPost);
  const post = postQuery.data ?? paramPost;

  const inputRef = useRef<TextInputRef>(null);

  // Deep-link sem objeto inicial: enquanto busca (ou se falhar), sem post ainda.
  if (!post) {
    return (
      <ScreenContainer>
        <Navbar />
        <View className="flex-1 items-center justify-center px-8">
          {postQuery.isError ? (
            <Text className="text-[14px] text-[#9E1B32] text-center" maxFontSizeMultiplier={0}>
              {t('feed.loadPostError')}
            </Text>
          ) : (
            <ActivityIndicator color="#9E1B32" />
          )}
        </View>
      </ScreenContainer>
    );
  }

  // Atualiza otimistamente o cache deste post (o cache do feed pode não conter
  // este item, já que veio da busca).
  const patchPost = (patch: (p: FeedItem) => FeedItem) =>
    queryClient.setQueryData<FeedItem>(['feed-event', post.id], (p) => (p ? patch(p) : p));

  return (
    <ScreenContainer>
      <Navbar />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}>
        <CommentsList
          postId={post.id}
          header={
            <PostDetailHeader
              post={post}
              currentUserId={user?.user_id}
              onPatch={patchPost}
              onFocusInput={() => inputRef.current?.focus()}
            />
          }
        />

        <CommentComposer
          postId={post.id}
          inputRef={inputRef}
          bottomInset={insets.bottom}
          onCommentCreated={() => patchPost((p) => ({ ...p, comments_count: p.comments_count + 1 }))}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
