import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import DashboardScreen from '../screens/dashboard';
import RanksScreen from '../screens/ranks';
import LegionsScreen from '../screens/legions';
import ProfileScreen from '../screens/profile';

export type HomeStackParamList = {
  Dashboard: undefined;
  Ranks: undefined;
  Legions: undefined;
  Profile: undefined;
};

export type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Ranks" component={RanksScreen} />
      <Stack.Screen name="Legions" component={LegionsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
