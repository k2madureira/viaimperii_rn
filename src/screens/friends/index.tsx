import React, { useState } from 'react';
import { View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/screenContainer';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { HomeNavigationProp, HomeStackParamList } from '../../navigation/HomeStack';
import { FriendsTab } from './components';
import { AddFriendSection, FriendsListSection, RequestsListSection } from './components/sections';
import { useFriendRequests } from './model/queries/useFriendRequests';

type Tab = 'friends' | 'requests';

// Tela de Amigos (§Amigos): buscar/adicionar por @handle, lista de amigos e
// pedidos (recebidos/enviados). O index só orquestra: header + abas + section ativa.
export default function FriendsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation<HomeNavigationProp>();
  const route = useRoute<RouteProp<HomeStackParamList, 'Friends'>>();
  const [tab, setTab] = useState<Tab>(route.params?.tab ?? 'friends');

  // Contagem de pedidos recebidos — badge na aba (uso compartilhado, fica no index).
  const incomingQuery = useFriendRequests('incoming');
  const incomingCount = incomingQuery.data?.total ?? 0;

  const openProfile = (userId: string) => navigation.navigate('Profile', { userId });

  return (
    <ScreenContainer>
      <Navbar />

      <View className="px-5 pt-4 gap-4">
        <AddFriendSection currentUserId={user?.user_id} />

        <View className="flex-row p-1 rounded-[14px] bg-[#f4eaea]">
          <FriendsTab
            label={t('friends.tabs.friends')}
            active={tab === 'friends'}
            onPress={() => setTab('friends')}
          />
          <FriendsTab
            label={t('friends.tabs.requests')}
            active={tab === 'requests'}
            badge={incomingCount}
            onPress={() => setTab('requests')}
          />
        </View>
      </View>

      <View className="flex-1">
        {tab === 'friends' ? (
          <FriendsListSection bottomInset={insets.bottom} onOpenProfile={openProfile} />
        ) : (
          <RequestsListSection bottomInset={insets.bottom} onOpenProfile={openProfile} />
        )}
      </View>
    </ScreenContainer>
  );
}
