import { DrawerNavigationProp } from '@react-navigation/drawer';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { Dimensions } from 'react-native';
import CampaignsScreen from '../screens/campaigns';
import LegionScreen from '../screens/legion';
import MissionsScreen from '../screens/missions';
import RankingScreen from '../screens/ranking';
import CustomDrawerContent from './CustomDrawerContent';
import HomeStack from './HomeStack';

export type AppDrawerParamList = {
  Home: undefined;
  Missions: undefined;
  Campaigns: undefined;
  Ranking: undefined;
  Legion: undefined;
};

export type DrawerNavProp = DrawerNavigationProp<AppDrawerParamList>;

const Drawer = createDrawerNavigator<AppDrawerParamList>();

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        drawerType: 'front',
        swipeEnabled: true,
        swipeEdgeWidth: 60,
        // Painel ocupa 40% da largura; o container é transparente para o
        // cartão interno (60% de altura) flutuar a 20% da altura.
        drawerStyle: { width: SCREEN_WIDTH * 0.4, backgroundColor: 'transparent' },
      }}>
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Missions" component={MissionsScreen} />
      <Drawer.Screen name="Campaigns" component={CampaignsScreen} />
      <Drawer.Screen name="Ranking" component={RankingScreen} />
      <Drawer.Screen name="Legion" component={LegionScreen} />
    </Drawer.Navigator>
  );
}
