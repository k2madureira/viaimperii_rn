import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import MissionsScreen from '../screens/missions';
import ProfessionMissionsScreen from '../screens/missions/professionMissions';
import { Profession } from '../api/professions';

export type MissionsStackParamList = {
  MissionsHome: undefined;
  // Missões de profissão — tela dedicada com carrossel de profissões adquiridas.
  // `profession` é a seleção inicial (opcional; senão usa a 1ª profissão ativa).
  ProfessionMissions: { profession?: Profession } | undefined;
};

export type MissionsNavigationProp = NativeStackNavigationProp<MissionsStackParamList>;

const Stack = createNativeStackNavigator<MissionsStackParamList>();

export default function MissionsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MissionsHome" component={MissionsScreen} />
      <Stack.Screen name="ProfessionMissions" component={ProfessionMissionsScreen} />
    </Stack.Navigator>
  );
}
