import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Share,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import Text from '../../../../../components/text';
import TextInput from '../../../../../components/textInput';
import { ShareNodesIcon } from '../../../../../components/icons';
import { viaimperiiApi } from '../../../../../api';
import { FriendItem } from '../../../../../api/friendship';
import { postShareUrl } from '../../../../../navigation/linking';

interface Props {
  visible: boolean;
  postId: number;
  body?: string | null;
  onClose: () => void;
}

// Trecho em texto plano do corpo do post (HTML) para acompanhar o link.
function postExcerpt(body?: string | null, max = 140): string {
  if (!body) return '';
  const plain = body
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[*_~`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length <= max ? plain : `${plain.slice(0, max).trimEnd()}…`;
}

// Compartilhar um post — bottom sheet estilo Instagram: grade de amigos (envia a DM
// por item, marca "Enviado", pode mandar p/ vários) + ação de compartilhar fora do app.
export default function SharePostModal({ visible, postId, body, onClose }: Props) {
  const { t } = useTranslation();
  const [term, setTerm] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const friendsQuery = useQuery({
    queryKey: ['friends'],
    queryFn: viaimperiiApi.friendship.listFriends,
    enabled: visible,
  });

  useEffect(() => {
    if (!visible) {
      setTerm('');
      setSendingId(null);
      setSentIds(new Set());
    }
  }, [visible]);

  const url = postShareUrl(postId);
  const excerpt = postExcerpt(body);
  const externalMessage = excerpt ? `"${excerpt}"\n\n${url}` : `${t('feed.shareText')}\n${url}`;
  const dmMessage = excerpt ? `${excerpt}\n${url}` : url;

  const q = term.trim().toLowerCase();
  const friends = (friendsQuery.data?.items ?? []).filter(
    (f) =>
      !q ||
      f.user.name.toLowerCase().includes(q) ||
      (f.user.handle ?? '').toLowerCase().includes(q),
  );

  const onExternal = async () => {
    onClose();
    try {
      await Share.share({ message: externalMessage });
    } catch {
      // usuário cancelou o sheet — ignora.
    }
  };

  const onSendToFriend = async (friend: FriendItem) => {
    if (sendingId || sentIds.has(friend.user.id)) return;
    setSendingId(friend.user.id);
    try {
      const conv = await viaimperiiApi.chat.openDm(friend.user.id);
      await viaimperiiApi.chat.sendMessage(conv.id, dmMessage);
      setSentIds((prev) => new Set(prev).add(friend.user.id));
    } catch (e) {
      Toast.show({ type: 'error', text1: (e as Error).message });
    } finally {
      setSendingId(null);
    }
  };

  const renderFriend = ({ item }: { item: FriendItem }) => {
    const avatar = item.user.active_avatar?.url ?? item.user.image ?? null;
    const initial = item.user.name?.trim().charAt(0).toUpperCase() || '?';
    const sent = sentIds.has(item.user.id);
    const sending = sendingId === item.user.id;
    return (
      <TouchableOpacity
        onPress={() => onSendToFriend(item)}
        disabled={sending || sent}
        activeOpacity={0.7}
        className="items-center py-2 px-1"
        style={{ width: '33.33%' }}>
        <View className="w-16 h-16 rounded-full bg-[#f4eaea] items-center justify-center overflow-hidden">
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: 64, height: 64 }} resizeMode="cover" />
          ) : (
            <Text className="text-[20px] font-bold text-primary-500">{initial}</Text>
          )}
        </View>
        <Text
          className="text-[12px] text-charcoal mt-1.5"
          numberOfLines={1}
          maxFontSizeMultiplier={0}>
          {item.user.name}
        </Text>
        <View
          className={`mt-1.5 px-4 py-1 rounded-full ${sent ? 'bg-[#ece5e5]' : 'bg-primary-500'}`}>
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text
              className={`text-[11px] font-bold ${sent ? 'text-[#8a8080]' : 'text-white'}`}
              maxFontSizeMultiplier={0}>
              {sent ? t('feed.shareSentShort') : t('feed.shareSend')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback onPress={() => {}}>
            <View className="bg-white rounded-t-[20px] pb-3">
              {/* Alça */}
              <View className="items-center pt-2.5 pb-1.5">
                <View className="w-10 h-1 rounded-full bg-[#dcd2d2]" />
              </View>

              {/* Busca */}
              <View className="px-4 pb-1">
                <View
                  className="flex-row items-center bg-[#f2eeee] rounded-[12px] px-3"
                  style={{ height: 42 }}>
                  <TextInput
                    value={term}
                    onChangeText={setTerm}
                    placeholder={t('feed.shareSearch')}
                    placeholderTextColor="#a99f9f"
                    autoCapitalize="none"
                    className="flex-1 text-[14px] text-charcoal"
                  />
                </View>
              </View>

              {/* Grade de amigos */}
              {friendsQuery.isLoading ? (
                <View className="py-10 items-center">
                  <ActivityIndicator color="#9E1B32" />
                </View>
              ) : friends.length === 0 ? (
                <Text
                  className="text-[13px] text-[#9a8f8f] text-center py-8 px-6"
                  maxFontSizeMultiplier={0}>
                  {t('feed.shareNoFriends')}
                </Text>
              ) : (
                <FlatList
                  data={friends}
                  numColumns={3}
                  keyExtractor={(f) => String(f.friendship_id)}
                  renderItem={renderFriend}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 6 }}
                  style={{ maxHeight: 360 }}
                />
              )}

              {/* Ações externas */}
              <View className="flex-row items-start gap-5 px-6 pt-3 border-t border-[#f0eded]">
                <TouchableOpacity onPress={onExternal} activeOpacity={0.8} className="items-center">
                  <View className="w-12 h-12 rounded-full bg-[#f2eeee] items-center justify-center">
                    <ShareNodesIcon size={22} color="#111" />
                  </View>
                  <Text
                    className="text-[11px] text-[#555] mt-1.5"
                    numberOfLines={1}
                    maxFontSizeMultiplier={0}>
                    {t('feed.shareMore')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
