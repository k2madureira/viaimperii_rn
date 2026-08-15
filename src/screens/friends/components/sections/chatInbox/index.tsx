import React, { useEffect, useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../../contexts/AuthContext';
import { UsersIcon, FlagIcon, StandardIcon } from '../../../../../components/icons';
import { CHAT_THEME } from '../../../../../constants/chatTheme';
import { useUserProfile } from '../../../../dashboard/model/queries/useUserProfile';
import { useUserClan } from '../../../../clan/model/queries/useUserClan';
import ChatTab from '../../buttons/chatTab';
import { useConversations } from '../../../model/queries/useConversations';
import FriendsListSection from '../friendsListSection';
import GroupChatSection from '../groupChatSection';

interface Props {
  bottomInset: number;
}

type SubTab = 'dm' | 'clan' | 'legion';

// Área de Chat com sub-abas Amigos (DM) / Clã / Legião. Cada aba traz o ícone e o
// contador de não-lidas (§Chat inbox). Clã/Legião ficam desabilitadas quando o
// usuário não pertence ao grupo.
export default function ChatInboxSection({ bottomInset }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sub, setSub] = useState<SubTab>('dm');

  const conversationsQuery = useConversations();
  const items = conversationsQuery.data?.items ?? [];

  // Pertencimento a grupo → habilita/desabilita as abas.
  const profileQuery = useUserProfile(user?.user_id);
  const legion = profileQuery.data?.legion ?? null;
  const clanQuery = useUserClan(user?.user_id);
  const hasLegion = !!legion;
  const hasClan = !!clanQuery.data?.clan;
  // Enquanto carrega, não desabilita (evita flicker); só desabilita quando resolvido.
  const legionDisabled = !profileQuery.isLoading && !hasLegion;
  const clanDisabled = !clanQuery.isLoading && !hasClan;

  const { dmUnread, clanUnread, legionUnread } = useMemo(() => {
    let dm = 0;
    let clan = 0;
    let legionU = 0;
    for (const c of items) {
      if (c.type === 'dm') dm += c.unread_count;
      else if (c.type === 'clan') clan += c.unread_count;
      else if (c.type === 'legion') legionU += c.unread_count;
    }
    return { dmUnread: dm, clanUnread: clan, legionUnread: legionU };
  }, [items]);

  // Se a aba ativa deixou de estar disponível, volta para Amigos.
  useEffect(() => {
    if ((sub === 'clan' && clanDisabled) || (sub === 'legion' && legionDisabled)) {
      setSub('dm');
    }
  }, [sub, clanDisabled, legionDisabled]);

  const legionImg = legion?.thumb_url ?? legion?.image_url ?? null;

  return (
    <View className="flex-1">
      <View className="px-5 pt-3">
        <View className="flex-row p-1 rounded-[14px] bg-[#f4eaea]">
          <ChatTab
            label={t('chat.tabs.friends')}
            active={sub === 'dm'}
            activeColor={CHAT_THEME.dm.accent}
            badge={dmUnread}
            renderIcon={(color) => <UsersIcon size={18} color={color} />}
            onPress={() => setSub('dm')}
          />
          <ChatTab
            label={t('chat.tabs.clan')}
            active={sub === 'clan'}
            activeColor={CHAT_THEME.clan.accent}
            badge={clanUnread}
            disabled={clanDisabled}
            renderIcon={(color) => <FlagIcon size={18} color={color} />}
            onPress={() => setSub('clan')}
          />
          <ChatTab
            label={t('chat.tabs.legion')}
            active={sub === 'legion'}
            activeColor={CHAT_THEME.legion.accent}
            badge={legionUnread}
            disabled={legionDisabled}
            renderIcon={(color) =>
              legionImg && !legionDisabled ? (
                <Image
                  source={{ uri: legionImg }}
                  style={{ width: 20, height: 20, borderRadius: 10 }}
                  resizeMode="cover"
                />
              ) : (
                <StandardIcon size={18} color={color} accentColor={color} />
              )
            }
            onPress={() => setSub('legion')}
          />
        </View>
      </View>

      <View className="flex-1">
        {sub === 'dm' && <FriendsListSection bottomInset={bottomInset} />}
        {sub === 'clan' && <GroupChatSection kind="clan" bottomInset={bottomInset} />}
        {sub === 'legion' && <GroupChatSection kind="legion" bottomInset={bottomInset} />}
      </View>
    </View>
  );
}
