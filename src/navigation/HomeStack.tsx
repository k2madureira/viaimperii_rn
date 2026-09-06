import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import DashboardScreen from '../screens/dashboard';
import RanksScreen from '../screens/ranks';
// `LegionHQ` é a tela inicial da legião (Quartel General do próprio viewer).
// `WarRoom` é a sala de inteligência: espia os números das OUTRAS legiões e
// fica atrás de uma compra (regras ainda não implementadas no backend).
import LegionHQScreen from '../screens/legions/HQ';
import WarRoomScreen from '../screens/legions';
import LegionDonationsScreen from '../screens/legions/donations';
import ProfileScreen from '../screens/profile';
import ClanScreen from '../screens/clan';
import ClanDirectoryScreen from '../screens/clanDirectory';
import PostDetailScreen from '../screens/postDetail';
import RewardsScreen from '../screens/rewards';
import HashtagFeedScreen from '../screens/hashtagFeed';
import LeaderboardsScreen from '../screens/leaderboards';
import AchievementsScreen from '../screens/achievements';
import FriendsScreen from '../screens/friends';
import DmConversationScreen from '../screens/dmConversation';
import ChestsScreen from '../screens/chests';
import ChestDetailScreen from '../screens/chests/chestDetail';
import RedeemCodeScreen from '../screens/redeemCode';
import { FeedItem } from '../api/feed';
import { LeaderboardScope } from '../api/leaderboards';
import { PresenceStatus } from '../api/friendship';

export type HomeStackParamList = {
  Dashboard: undefined;
  Ranks: undefined;
  // O QG deriva a legião do perfil do usuário — não recebe param.
  LegionHQ: undefined;
  WarRoom: undefined;
  // Movimentações do cofre (doações + gastos) — tela dedicada; o QG só leva até ela.
  LegionDonations: { legionId: number; legionName?: string; color?: string };
  Profile: { userId?: string } | undefined;
  // Sem clanId → clã do usuário logado (entrada pelo card do Perfil); com clanId →
  // detalhe de um clã do diretório.
  Clan: { clanId?: number } | undefined;
  ClanDirectory: undefined;
  // `post` para navegação interna (render instantâneo); `postId` para o deep-link
  // (viaimperii://post/:postId) — chega como string na URL, a tela faz Number().
  PostDetail: { post?: FeedItem; postId?: number | string };
  Rewards: undefined;
  HashtagFeed: { tag: string };
  Leaderboards:
    | { scope?: LeaderboardScope; scopeId?: number; isoYear?: number; isoWeek?: number }
    | undefined;
  Achievements: undefined;
  Friends: { tab?: 'chat' | 'amigos' | 'requests' } | undefined;
  DmConversation: {
    userId: string;
    name: string;
    avatarUrl?: string | null;
    presenceStatus?: PresenceStatus;
  };
  // Baús de Riquezas (§35): lista, detalhe/abertura. Resgate unificado de código
  // (§35 endpoint unificado): promo ou fundador (§34), detectado no backend.
  Chests: undefined;
  ChestDetail: { userChestId: number };
  RedeemCode: undefined;
};

export type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Ranks" component={RanksScreen} />
      <Stack.Screen name="LegionHQ" component={LegionHQScreen} />
      <Stack.Screen name="WarRoom" component={WarRoomScreen} />
      <Stack.Screen name="LegionDonations" component={LegionDonationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Clan" component={ClanScreen} />
      <Stack.Screen name="ClanDirectory" component={ClanDirectoryScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="HashtagFeed" component={HashtagFeedScreen} />
      <Stack.Screen name="Leaderboards" component={LeaderboardsScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="DmConversation" component={DmConversationScreen} />
      <Stack.Screen name="Chests" component={ChestsScreen} />
      <Stack.Screen name="ChestDetail" component={ChestDetailScreen} />
      <Stack.Screen name="RedeemCode" component={RedeemCodeScreen} />
    </Stack.Navigator>
  );
}
