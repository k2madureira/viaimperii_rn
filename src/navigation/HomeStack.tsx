import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import DashboardScreen from '../screens/dashboard';
import RanksScreen from '../screens/ranks';

export type HomeStackParamList = {
  Dashboard: undefined;
  Ranks: undefined;
};

export type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Ranks" component={RanksScreen} />
    </Stack.Navigator>
  );
}
