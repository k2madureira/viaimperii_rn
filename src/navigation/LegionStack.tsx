import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LegionsScreen from '../screens/legions';
import WarRoomScreen from '../screens/legions/WarRoom';

export type LegionStackParamList = {
  LegionsList: undefined;
  WarRoom: { legionId: number };
};

export type LegionNavigationProp = NativeStackNavigationProp<LegionStackParamList>;

const Stack = createNativeStackNavigator<LegionStackParamList>();

export default function LegionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LegionsList" component={LegionsScreen} />
      <Stack.Screen name="WarRoom" component={WarRoomScreen} />
    </Stack.Navigator>
  );
}
