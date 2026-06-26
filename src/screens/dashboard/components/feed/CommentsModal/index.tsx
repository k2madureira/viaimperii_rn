import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedComment, FeedItem } from '../../../../../api/feed/feedApi';
import { parseBackendDate } from '../../../../../utils/date';
import { useFeedComments } from '../../../model/queries/useFeedComments';
import { useCreateComment } from '../../../model/mutations/useCreateComment';

interface Props {
  item: FeedItem | null;
  onClose: () => void;
}

const SCREEN_H = Dimensions.get('window').height;

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
          <Text className="text-[11px] font-bold text-bg-primary-500">{initials(comment.author.name)}</Text>
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

export default function CommentsModal({ item, onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const eventId = item?.id ?? null;

  const commentsQuery = useFeedComments(eventId, item != null);
  const createM = useCreateComment();
  const [text, setText] = useState('');

  // Apenas a folha (sheet) desliza de baixo; o escurecimento (backdrop) já cobre
  // a tela inteira assim que o modal abre (animationType="fade" anima a opacidade
  // de uma camada full-screen, sem "subir" junto com o conteúdo).
  const sheetY = useRef(new Animated.Value(SCREEN_H)).current;
  useEffect(() => {
    if (item != null) {
      sheetY.setValue(SCREEN_H);
      Animated.timing(sheetY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [item, sheetY]);

  const comments = (commentsQuery.data?.pages ?? []).flatMap((p) => p.items);

  const submit = () => {
    const body = text.trim();
    if (!body || eventId == null) return;
    createM.mutate({ eventId, body }, { onSuccess: () => setText('') });
  };

  return (
    <Modal
      transparent
      visible={item != null}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        {/* Backdrop full-screen (cobre toda a tela já na abertura) */}
        <Pressable
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end' }}
          pointerEvents="box-none">
          <Animated.View
            className="bg-white rounded-t-[24px]"
            style={{ maxHeight: '80%', paddingBottom: insets.bottom, transform: [{ translateY: sheetY }] }}>
            {/* Handle + título */}
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 rounded-full bg-[#ddd]" />
            </View>
            <View className="flex-row items-center justify-between px-4 pb-2 border-b border-[#f0eded]">
              <Text className="text-[15px] font-extrabold text-charcoal">{t('feed.commentsTitle')}</Text>
              <TouchableOpacity onPress={onClose} className="px-2 py-1">
                <Text className="text-[20px] text-[#bbb]">✕</Text>
              </TouchableOpacity>
            </View>

            {commentsQuery.isLoading ? (
              <View className="py-12 items-center">
                <ActivityIndicator color="#8B1A2B" />
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(c) => String(c.id)}
                renderItem={({ item: c }) => <CommentRow comment={c} />}
                contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                onEndReachedThreshold={0.4}
                onEndReached={() => {
                  if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
                    commentsQuery.fetchNextPage();
                  }
                }}
                ListEmptyComponent={
                  <View className="py-12 items-center px-6">
                    <Text className="text-[13px] text-[#999] text-center">{t('feed.noComments')}</Text>
                  </View>
                }
                ListFooterComponent={
                  commentsQuery.isFetchingNextPage ? (
                    <View className="py-3 items-center">
                      <ActivityIndicator color="#8B1A2B" size="small" />
                    </View>
                  ) : null
                }
              />
            )}

            {/* Campo de novo comentário */}
            <View className="flex-row items-end gap-2 px-4 pt-2 border-t border-[#f0eded]">
              <TextInput
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
                  text.trim() && !createM.isPending ? 'bg-bg-primary-500' : 'bg-bg-primary-500/40'
                }`}>
                {createM.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-[16px] text-white">➤</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
