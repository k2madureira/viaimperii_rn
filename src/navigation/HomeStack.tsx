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
import ProfileScreen from '../screens/profile';
import PostDetailScreen from '../screens/postDetail';
import RewardsScreen from '../screens/rewards';
import HashtagFeedScreen from '../screens/hashtagFeed';
import LeaderboardsScreen from '../screens/leaderboards';
import AchievementsScreen from '../screens/achievements';
import FriendsScreen from '../screens/friends';
import DmConversationScreen from '../screens/dmConversation';
import { FeedItem } from '../api/feed';
import { LeaderboardScope } from '../api/leaderboards';
import { PresenceStatus } from '../api/friendship';

export type HomeStackParamList = {
  Dashboard: undefined;
  Ranks: undefined;
  // O QG deriva a legião do perfil do usuário — não recebe param.
  LegionHQ: undefined;
  WarRoom: undefined;
  Profile: { userId?: string } | undefined;
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
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="HashtagFeed" component={HashtagFeedScreen} />
      <Stack.Screen name="Leaderboards" component={LeaderboardsScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="DmConversation" component={DmConversationScreen} />
    </Stack.Navigator>
  );
}
