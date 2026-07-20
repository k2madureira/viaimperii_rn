import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import DashboardScreen from '../screens/dashboard';
import RanksScreen from '../screens/ranks';
import LegionsScreen from '../screens/legions';
import WarRoomScreen from '../screens/legions/WarRoom';
import ProfileScreen from '../screens/profile';
import PostDetailScreen from '../screens/postDetail';
import RewardsScreen from '../screens/rewards';
import HashtagFeedScreen from '../screens/hashtagFeed';
import LeaderboardsScreen from '../screens/leaderboards';
import AchievementsScreen from '../screens/achievements';
import { FeedItem } from '../api/feed';
import { LeaderboardScope } from '../api/leaderboards';

export type HomeStackParamList = {
  Dashboard: undefined;
  Ranks: undefined;
  Legions: undefined;
  WarRoom: { legionId: number };
  Profile: { userId?: string } | undefined;
  PostDetail: { post: FeedItem };
  Rewards: undefined;
  HashtagFeed: { tag: string };
  Leaderboards:
    | { scope?: LeaderboardScope; scopeId?: number; isoYear?: number; isoWeek?: number }
    | undefined;
  Achievements: undefined;
};

export type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Ranks" component={RanksScreen} />
      <Stack.Screen name="Legions" component={LegionsScreen} />
      <Stack.Screen name="WarRoom" component={WarRoomScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="HashtagFeed" component={HashtagFeedScreen} />
      <Stack.Screen name="Leaderboards" component={LeaderboardsScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
    </Stack.Navigator>
  );
}
