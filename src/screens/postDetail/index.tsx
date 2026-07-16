import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useRef } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../../components';
import { FeedItem } from '../../api/feed/feedApi';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { useAuth } from '../../contexts/AuthContext';
import { useFeedEvent } from '../dashboard/model/queries/useFeedEvent';
import { CommentComposer, CommentsList, PostDetailHeader } from './components/sections';

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<HomeStackParamList, 'PostDetail'>>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // O item da busca é usado como dado inicial; o hook refaz em segundo plano
  // para trazer reações/contagem atualizadas do servidor.
  const postQuery = useFeedEvent(route.params.post.id, route.params.post);
  const post = postQuery.data ?? route.params.post;

  const inputRef = useRef<TextInput>(null);

  // Atualiza otimistamente o cache deste post (o cache do feed pode não conter
  // este item, já que veio da busca).
  const patchPost = (patch: (p: FeedItem) => FeedItem) =>
    queryClient.setQueryData<FeedItem>(['feed-event', post.id], (p) => (p ? patch(p) : p));

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
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
    </View>
  );
}
