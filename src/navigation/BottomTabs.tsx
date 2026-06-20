import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeIcon from './icons/HomeIcon';
import MissionsIcon from './icons/MissionsIcon';
import LegionIcon from './icons/LegionIcon';
import AchievementsIcon from './icons/AchievementsIcon';
import MissionsScreen from '../screens/missions';
import LegionsScreen from '../screens/legions';
import AchievementsScreen from '../screens/achievements';
import HomeStack from './HomeStack';

export type BottomTabParamList = {
  Home: undefined;
  Missions: undefined;
  Legion: undefined;
  Achievements: undefined;
};

export type BottomTabNavProp = BottomTabNavigationProp<BottomTabParamList>;

const Tab = createBottomTabNavigator<BottomTabParamList>();

type IconComponent = (props: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) => React.ReactElement;

const TAB_ICON: Record<keyof BottomTabParamList, IconComponent> = {
  Home: HomeIcon,
  Missions: MissionsIcon,
  Legion: LegionIcon,
  Achievements: AchievementsIcon,
};

const TAB_LABEL: Record<keyof BottomTabParamList, string> = {
  Home: 'Início',
  Missions: 'Missões',
  Legion: 'Legião',
  Achievements: 'Conquistas',
};

export default function BottomTabs() {
  const insets = useSafeAreaInsets();
  // Eleva a barra acima da área de gestos do sistema (home indicator / nav bar).
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 12);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#9E1B32',
        tabBarInactiveTintColor: '#9aa0a6',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarItemStyle: { paddingTop: 4 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EAEAEA',
          height: 60 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
        },
        tabBarIcon: ({ focused }) => {
          const Icon = TAB_ICON[route.name];
          return (
            <Icon
              size={23}
              color={focused ? '#9E1B32' : '#9aa0a6'}
              strokeWidth={focused ? 2.2 : 2}
            />
          );
        },
        tabBarLabel: TAB_LABEL[route.name],
      })}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Missions" component={MissionsScreen} />
      <Tab.Screen name="Legion" component={LegionsScreen} />
      <Tab.Screen name="Achievements" component={AchievementsScreen} />
    </Tab.Navigator>
  );
}
