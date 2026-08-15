import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { CHAT_THEME, ChatContext } from '../../../../../constants/chatTheme';
import { MessageItem } from '../../../../../api/chat';
import MessageBubble from '../../cards/messageBubble';
import { useMessages } from '../../../model/queries/useMessages';
import { useSendMessage } from '../../../model/mutations/useSendMessage';
import { useMarkRead } from '../../../model/mutations/useMarkRead';

interface Props {
  conversationId: number | null;
  // Não-lidas ao abrir (do inbox): define onde começa a leitura + o botão "ir ao fim".
  initialUnread?: number;
  // Sala de grupo → mostra o nome do remetente nas bolhas dos outros.
  showSender?: boolean;
  // Contexto define a paleta (Amigos/Clã/Legião).
  context?: ChatContext;
  bottomInset?: number;
}

// Item do divisor "novas mensagens" injetado no histórico invertido.
type DividerRow = { __divider: true; id: number };
type Row = MessageItem | DividerRow;
const isDivider = (r: Row): r is DividerRow => (r as DividerRow).__divider === true;

// Núcleo da conversa (DM ou sala de grupo): histórico keyset numa lista invertida
// (mais recente embaixo), composer fixo e — quando há não-lidas — abre na última
// leitura (divisor) com o botão flutuante "Ir para as mais recentes".
export default function ChatThreadView({
  conversationId,
  initialUnread = 0,
  showSender = false,
  context = 'dm',
  bottomInset = 0,
}: Props) {
  const { t } = useTranslation();
  const theme = CHAT_THEME[context];
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [pendingUnread, setPendingUnread] = useState(0);

  const listRef = useRef<FlatList<Row>>(null);
  const frozenUnreadRef = useRef<number | null>(null); // congela o unread da abertura
  const lastMarkedRef = useRef<number | null>(null); // última msg marcada como lida
  const didInitRef = useRef(false);
  // Espelho síncrono de `atBottom` — o efeito de marcar-lido lê o ref (não o state)
  // para não disparar antes do efeito de init aplicar o `setAtBottom(false)`.
  const atBottomRef = useRef(true);

  const setBottom = (v: boolean) => {
    atBottomRef.current = v;
    setAtBottom(v);
  };

  const messagesQuery = useMessages(conversationId);
  const sendM = useSendMessage(conversationId ?? 0);
  const markReadM = useMarkRead();

  // Lista invertida: `flat` é desc (mais recente primeiro).
  const flat = useMemo(
    () => (messagesQuery.data?.pages ?? []).flatMap((p) => p.items),
    [messagesQuery.data],
  );
  const newestId = flat[0]?.id ?? null;

  // Congela o total de não-lidas na primeira carga de mensagens.
  if (frozenUnreadRef.current === null && !messagesQuery.isLoading) {
    frozenUnreadRef.current = Math.max(0, initialUnread);
  }
  const frozenUnread = frozenUnreadRef.current ?? 0;

  // Índice do divisor: as `frozenUnread` mensagens mais novas ficam abaixo dele.
  const boundary = frozenUnread > 0 ? Math.min(frozenUnread, flat.length) : 0;
  const data: Row[] = useMemo(() => {
    if (boundary <= 0) return flat;
    return [...flat.slice(0, boundary), { __divider: true, id: -1 }, ...flat.slice(boundary)];
  }, [flat, boundary]);

  // Ao abrir: se há não-lidas, posiciona no divisor (última leitura) e mantém o
  // botão de "ir ao fim"; sem não-lidas, fica no fim e marca lido.
  useEffect(() => {
    if (didInitRef.current || messagesQuery.isLoading || conversationId == null) return;
    didInitRef.current = true;
    if (boundary > 0) {
      setBottom(false);
      setPendingUnread(frozenUnread);
      requestAnimationFrame(() => {
        try {
          listRef.current?.scrollToIndex({ index: boundary, viewPosition: 0.85, animated: false });
        } catch {
          // layout ainda não medido — onScrollToIndexFailed cobre o retry.
        }
      });
    } else {
      setBottom(true); // sem não-lidas: já no fim, libera a marcação de leitura
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesQuery.isLoading, conversationId, boundary]);

  // Marca lido quando o usuário está no fim (vê a mensagem mais nova). Lê o ref
  // `atBottomRef` para evitar a corrida com o efeito de init no mesmo commit.
  useEffect(() => {
    if (
      atBottomRef.current &&
      conversationId != null &&
      newestId != null &&
      lastMarkedRef.current !== newestId
    ) {
      lastMarkedRef.current = newestId;
      setPendingUnread(0);
      markReadM.mutate({ conversationId, lastReadMessageId: newestId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atBottom, newestId, conversationId]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Lista invertida: offset.y ~ 0 = mensagem mais nova visível (fim).
    setBottom(e.nativeEvent.contentOffset.y <= 24);
  };

  const goToBottom = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    setBottom(true);
  };

  const onSend = () => {
    const body = text.trim();
    if (!body || conversationId == null || sendM.isPending) return;
    sendM.mutate(body, {
      onSuccess: () => {
        setText('');
        goToBottom();
      },
      onError: (err) => Toast.show({ type: 'error', text1: (err as Error).message }),
    });
  };

  const loadOlder = () => {
    if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      messagesQuery.fetchNextPage();
    }
  };

  const renderMessages = () => {
    if (messagesQuery.isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.accent} />
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
      <View className="flex-1">
        <FlatList
          ref={listRef}
          data={data}
          inverted
          keyExtractor={(row) => (isDivider(row) ? 'unread-divider' : String(row.id))}
          renderItem={({ item }) =>
            isDivider(item) ? (
              <View className="flex-row items-center gap-2 my-2 px-2">
                <View className="flex-1 h-[1px]" style={{ backgroundColor: `${theme.accent}40` }} />
                <Text className="text-[11px] font-bold" style={{ color: theme.accent }}>
                  {t('chat.thread.newMessages')}
                </Text>
                <View className="flex-1 h-[1px]" style={{ backgroundColor: `${theme.accent}40` }} />
              </View>
            ) : (
              <MessageBubble message={item} showSender={showSender} context={context} />
            )
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onEndReached={loadOlder}
          onEndReachedThreshold={0.3}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              try {
                listRef.current?.scrollToIndex({
                  index: Math.min(info.index, data.length - 1),
                  viewPosition: 0.85,
                  animated: false,
                });
              } catch {
                // desiste silenciosamente — o usuário já pode rolar manualmente.
              }
            }, 250);
          }}
          ListFooterComponent={
            messagesQuery.isFetchingNextPage ? (
              <View className="py-3 items-center">
                <ActivityIndicator size="small" color={theme.accent} />
              </View>
            ) : null
          }
        />

        {/* Botão flutuante "Ir para as mais recentes" — só quando não está no fim */}
        {!atBottom && (
          <TouchableOpacity
            onPress={goToBottom}
            activeOpacity={0.85}
            className="absolute right-4 bottom-3 flex-row items-center gap-1.5 rounded-full pl-3.5 pr-3 py-2 shadow-md"
            style={{ elevation: 4, backgroundColor: theme.accent }}>
            <Text className="text-[12px] font-bold" style={{ color: theme.onAccent }}>
              {t('chat.thread.jumpRecent')}
            </Text>
            {pendingUnread > 0 && (
              <View className="min-w-[18px] h-[18px] px-1 rounded-full bg-white items-center justify-center">
                <Text className="text-[10px] font-extrabold leading-none" style={{ color: theme.accent }}>
                  {pendingUnread > 99 ? '99+' : pendingUnread}
                </Text>
              </View>
            )}
            <Text className="text-[14px] leading-none" style={{ color: theme.onAccent }}>
              ↓
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
          <EmojiIcon size={24} color={emojiOpen ? theme.accent : '#9a8f8f'} />
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
          className="px-4 h-10 items-center justify-center rounded-[18px]"
          style={{ backgroundColor: !text.trim() || sendM.isPending ? '#e5d7d9' : theme.accent }}>
          {sendM.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-[13px] font-bold" style={{ color: theme.onAccent }}>
              {t('chat.thread.send')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
