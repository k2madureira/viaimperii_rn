import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import Text from '../../../../../components/text';
import TextInput from '../../../../../components/textInput';
import { EmojiIcon } from '../../../../../components/icons';
import { CHAT_BODY_MAX, CHAT_EMOJIS } from '../../../../../constants/chat';
import { MessageItem } from '../../../../../api/chat';
import MessageBubble from '../../cards/messageBubble';
import { useDmConversation } from '../../../model/queries/useDmConversation';
import { useMessages } from '../../../model/queries/useMessages';
import { useSendMessage } from '../../../model/mutations/useSendMessage';
import { useMarkRead } from '../../../model/mutations/useMarkRead';

interface Props {
  friendUserId: string;
  bottomInset?: number;
}

// Corpo da conversa (tela dedicada, estilo Instagram): abre a DM lazy, mostra o
// histórico keyset numa lista invertida (mais recente embaixo) e o composer fixo
// com seletor de emojis em drop-up. Ocupa flex-1 dentro da tela.
export default function ChatThread({ friendUserId, bottomInset = 0 }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);

  const convQuery = useDmConversation(friendUserId);
  const conversationId = convQuery.data?.id ?? null;

  const messagesQuery = useMessages(conversationId);
  const sendM = useSendMessage(conversationId ?? 0);
  const markReadM = useMarkRead();

  // Lista invertida: `flat` é desc (mais recente primeiro) — casa com `inverted`,
  // que renderiza o primeiro item embaixo.
  const flat = (messagesQuery.data?.pages ?? []).flatMap((p) => p.items);
  const newestId = flat[0]?.id ?? null;

  // Marca lido ao abrir a conversa ou quando chega uma mensagem mais nova.
  useEffect(() => {
    if (conversationId != null && newestId != null) {
      markReadM.mutate({ conversationId, lastReadMessageId: newestId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, newestId]);

  const onSend = () => {
    const body = text.trim();
    if (!body || conversationId == null || sendM.isPending) return;
    sendM.mutate(body, {
      onSuccess: () => setText(''),
      onError: (e) => Toast.show({ type: 'error', text1: (e as Error).message }),
    });
  };

  const loadOlder = () => {
    if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      messagesQuery.fetchNextPage();
    }
  };

  // ── Estados de abertura da conversa ──────────────────────────────────────────
  if (convQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#9E1B32" />
      </View>
    );
  }

  if (convQuery.isError) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-[14px] text-[#9E1B32] text-center" maxFontSizeMultiplier={0}>
          {(convQuery.error as Error)?.message ?? t('chat.errors.openDm')}
        </Text>
      </View>
    );
  }

  const renderMessages = () => {
    if (messagesQuery.isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#9E1B32" />
        </View>
      );
    }
    if (flat.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[13px] text-[#9a8f8f] text-center" maxFontSizeMultiplier={0}>
            {t('chat.thread.empty')}
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={flat}
        inverted
        keyExtractor={(m: MessageItem) => String(m.id)}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadOlder}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          messagesQuery.isFetchingNextPage ? (
            <View className="py-3 items-center">
              <ActivityIndicator size="small" color="#9E1B32" />
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1">{renderMessages()}</View>

      {/* Seletor de emojis — drop-up acima do composer */}
      {emojiOpen && (
        <View className="border-t border-[#f0eded] bg-white" style={{ height: 210 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap p-1">
              {CHAT_EMOJIS.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setText((prev) => prev + e)}
                  activeOpacity={0.6}
                  className="w-[12.5%] items-center py-2">
                  <Text style={{ fontSize: 26 }} maxFontSizeMultiplier={0}>
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Composer */}
      <View
        className="flex-row items-end gap-1.5 px-3 pt-2 border-t border-[#f3eeee] bg-[#fafafa]"
        style={{ paddingBottom: (bottomInset || 8) + 8 }}>
        <TouchableOpacity
          onPress={() => setEmojiOpen((v) => !v)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('chat.thread.emoji')}
          className="w-10 h-10 items-center justify-center">
          <EmojiIcon size={24} color={emojiOpen ? '#9E1B32' : '#9a8f8f'} />
        </TouchableOpacity>
        <View className="flex-1 bg-white border border-[#eee4e4] rounded-[18px] px-3 py-1.5">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('chat.thread.placeholder')}
            placeholderTextColor="#a99f9f"
            multiline
            maxLength={CHAT_BODY_MAX}
            onFocus={() => setEmojiOpen(false)}
            className="text-[15px] text-[#2b2b2b] max-h-[110px]"
          />
        </View>
        <TouchableOpacity
          onPress={onSend}
          disabled={!text.trim() || sendM.isPending}
          activeOpacity={0.8}
          className={`px-4 h-10 items-center justify-center rounded-[18px] ${
            !text.trim() || sendM.isPending ? 'bg-[#e5d7d9]' : 'bg-primary-500'
          }`}>
          {sendM.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-[13px] font-bold text-white">{t('chat.thread.send')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
