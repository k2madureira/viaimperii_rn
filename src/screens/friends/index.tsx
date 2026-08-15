import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/screenContainer';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { HomeNavigationProp, HomeStackParamList } from '../../navigation/HomeStack';
import { FriendsTab } from './components';
import { AmigosSection, ChatInboxSection, RequestsListSection } from './components/sections';
import { useFriendRequests } from './model/queries/useFriendRequests';

type Tab = 'chat' | 'amigos' | 'requests';

// Tela de Chat + Amigos (§Amigos/§Chat). Abas: Chat (amigos em sanfona, tocar abre
// a DM) e Amigos (buscar/adicionar + gestão). "Pedidos" só aparece quando há
// requisições pendentes. O index só orquestra; mantém o SSE de chat aberto.
export default function FriendsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation<HomeNavigationProp>();
  const route = useRoute<RouteProp<HomeStackParamList, 'Friends'>>();
  const [tab, setTab] = useState<Tab>(route.params?.tab ?? 'chat');

  // Nota: o SSE de chat é conectado globalmente em BottomTabs (sessão inteira),
  // não mais por esta tela — evita stream duplicado.

  // Pedidos recebidos/enviados — a aba "Pedidos" só existe se houver algum.
  const incomingQuery = useFriendRequests('incoming');
  const outgoingQuery = useFriendRequests('outgoing');
  const incomingCount = incomingQuery.data?.total ?? 0;
  const outgoingCount = outgoingQuery.data?.total ?? 0;
  const hasRequests = incomingCount > 0 || outgoingCount > 0;

  // Se a aba de pedidos some (requisições zeradas), volta para o Chat.
  useEffect(() => {
    if (tab === 'requests' && !hasRequests) setTab('chat');
  }, [tab, hasRequests]);

  const openProfile = (userId: string) => navigation.navigate('Profile', { userId });

  return (
    <ScreenContainer>
      <Navbar />

      <View className="px-5 pt-4">
        <View className="flex-row p-1 rounded-[14px] bg-[#f4eaea]">
          <FriendsTab
            label={t('friends.tabs.chat')}
            active={tab === 'chat'}
            onPress={() => setTab('chat')}
          />
          <FriendsTab
            label={t('friends.tabs.friends')}
            active={tab === 'amigos'}
            onPress={() => setTab('amigos')}
          />
          {hasRequests && (
            <FriendsTab
              label={t('friends.tabs.requests')}
              active={tab === 'requests'}
              badge={incomingCount}
              onPress={() => setTab('requests')}
            />
          )}
        </View>
      </View>

      <View className="flex-1">
        {tab === 'chat' && <ChatInboxSection bottomInset={insets.bottom} />}
        {tab === 'amigos' && (
          <AmigosSection
            bottomInset={insets.bottom}
            currentUserId={user?.user_id}
            onOpenProfile={openProfile}
          />
        )}
        {tab === 'requests' && (
          <RequestsListSection bottomInset={insets.bottom} onOpenProfile={openProfile} />
        )}
      </View>
    </ScreenContainer>
  );
}
