import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { BellIcon } from '../../../../../components/icons';
import { formatRelativeTime } from '../../../../../utils/date';
import { viaimperiiApi } from '../../../../../api';
import { NotificationItem } from '../../../../../api/notifications';
import { HomeNavigationProp } from '../../../../../navigation/HomeStack';
import AnchoredPopover, { Anchor } from '../../feed/AnchoredPopover';
import { useNotifications } from '../../../model/queries/useNotifications';
import { useUnreadNotificationsCount } from '../../../model/queries/useUnreadNotificationsCount';
import { useMarkNotificationRead } from '../../../model/mutations/useMarkNotificationRead';
import { useMarkAllNotificationsRead } from '../../../model/mutations/useMarkAllNotificationsRead';
import { notificationMessage } from './notificationMessage';

// Tipos cujo evento aconteceu num post do feed — clicar navega para o detalhe.
const POST_NOTIFICATION_TYPES = new Set(['feed_comment', 'feed_reaction', 'feed_mention']);

// Emoji de fallback para notificações "de conquista própria" (sem outro
// usuário envolvido, `actor` null).
const SELF_TYPE_EMOJI: Record<string, string> = {
  mission_finalized: '⚔️',
  rank_up: '🎖️',
  medal_earned: '🏅',
  // `legion_standard_resolved` não tem ator (é da legião, não de alguém)
  legion_standard_resolved: '🏛️',
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

// Avatar do autor da ação (comentário/reação/aprovação/seguidor) — mesmo
// padrão de avatar circular do FeedCard. Sem `actor` (conquista do próprio
// usuário), mostra um emblema com emoji do tipo do evento.
function NotificationAvatar({ item }: { item: NotificationItem }) {
  if (item.actor) {
    const avatarUrl = item.actor.active_avatar?.url ?? item.actor.image ?? null;
    return (
      <View className="w-8 h-8 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 32, height: 32 }} resizeMode="cover" />
        ) : (
          <Text className="text-[11px] font-bold text-primary-500">{initials(item.actor.name)}</Text>
        )}
      </View>
    );
  }
  return (
    <View className="w-8 h-8 rounded-full bg-[#faf0e0] items-center justify-center">
      <Text className="text-[14px]">{SELF_TYPE_EMOJI[item.type] ?? '🔔'}</Text>
    </View>
  );
}

// Sino de notificações no topo da tela: badge com a contagem de não lidas
// (mesmo padrão do ícone de Missões na tab bar) e dropdown com o histórico.
// Sem notificação não lida, o sino fica desabilitado (nada para mostrar).
export default function NotificationsButton() {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  const anchorRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);
  const isOpen = anchor != null;

  const unreadQuery = useUnreadNotificationsCount();
  const unreadCount = unreadQuery.data?.count ?? 0;
  const disabled = unreadCount === 0;

  const listQuery = useNotifications(isOpen);
  const markReadM = useMarkNotificationRead();
  const markAllM = useMarkAllNotificationsRead();

  const items = (listQuery.data?.pages ?? []).flatMap((page) => page.items);

  const open = () => {
    if (disabled) return;
    anchorRef.current?.measureInWindow((x, y, w, h) => setAnchor({ x, y, width: w, height: h }));
  };

  const handlePress = async (item: NotificationItem) => {
    if (!item.read) markReadM.mutate(item.id);

    // Prêmio de placar → abre a screen `leaderboards` no escopo/semana do payload.
    if (item.type === 'leaderboard_prize') {
      const p = item.payload ?? {};
      setAnchor(null);
      navigation.navigate('Leaderboards', {
        scope: p.scope,
        scopeId: p.scope_key ?? undefined,
        isoYear: p.iso_year ?? undefined,
        isoWeek: p.iso_week ?? undefined,
      });
      return;
    }

    // Votação de estandarte → abre a tela de Legiões, onde o cofre da legião do
    // viewer traz o card de votação. Sem esse atalho a proposta morre por
    // inércia: o deep-link é parte do que faz a mecânica girar.
    if (
      item.type === 'legion_standard_proposed' ||
      item.type === 'legion_standard_resolved'
    ) {
      setAnchor(null);
      navigation.navigate('Legions');
      return;
    }

    const feedEventId = item.payload?.feed_event_id;
    if (!POST_NOTIFICATION_TYPES.has(item.type) || feedEventId == null) return;

    setOpeningId(item.id);
    try {
      const post = await viaimperiiApi.feed.detail(feedEventId);
      setAnchor(null);
      navigation.navigate('PostDetail', { post });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: t('toasts.notificationsOpenPostError'), text2: error.message });
    } finally {
      setOpeningId(null);
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={openingId === item.id}
      onPress={() => handlePress(item)}
      className={`px-4 py-3 border-b border-[#f5f0f0] flex-row items-start gap-2.5 ${
        item.read ? '' : 'bg-[#fbf2f2]'
      }`}>
      <NotificationAvatar item={item} />
      <View className="flex-1">
        <Text className="text-[12.5px] text-charcoal leading-[17px]">
          {notificationMessage(t, item)}
        </Text>
        <Text className="text-[10px] text-[#999] mt-1">{formatRelativeTime(item.created_at, t)}</Text>
      </View>
      {openingId === item.id ? (
        <ActivityIndicator size="small" color="#8B1A2B" />
      ) : (
        !item.read && <View className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5" />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <View ref={anchorRef} collapsable={false}>
        <TouchableOpacity
          onPress={open}
          disabled={disabled}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          accessibilityLabel={t('notifications.title')}
          className={`w-9 h-9 items-center justify-center ${disabled ? 'opacity-35' : ''}`}>
          <BellIcon size={22} color={disabled ? '#b8b0b0' : '#111'} />
          {unreadCount > 0 && (
            <View
              className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-primary-500 items-center justify-center px-1"
              style={{ borderWidth: 1.5, borderColor: '#fff' }}>
              <Text className="text-[9px] font-extrabold text-white leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <AnchoredPopover anchor={anchor} onClose={() => setAnchor(null)} width={300} align="right">
        <View className="px-4 pt-3.5 pb-2.5 flex-row items-center justify-between border-b border-[#f0f0f0]">
          <Text className="text-[13px] font-extrabold text-charcoal">{t('notifications.title')}</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={() => markAllM.mutate()} disabled={markAllM.isPending}>
              <Text className="text-[11px] font-bold text-primary-500">
                {t('notifications.markAllRead')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {listQuery.isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#8B1A2B" />
          </View>
        ) : items.length === 0 ? (
          <View className="py-8 items-center px-4">
            <Text className="text-[12px] text-[#999]">{t('notifications.empty')}</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            style={{ maxHeight: 360 }}
            showsVerticalScrollIndicator
            renderItem={renderItem}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
                listQuery.fetchNextPage();
              }
            }}
            ListFooterComponent={
              listQuery.isFetchingNextPage ? (
                <View className="py-3 items-center">
                  <ActivityIndicator size="small" color="#8B1A2B" />
                </View>
              ) : null
            }
          />
        )}
      </AnchoredPopover>
    </>
  );
}
