import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import BottomTabs from './BottomTabs';
import AuthStack from './AuthStack';

// Um ÚNICO navegador raiz com telas condicionais (padrão de "auth flow" do React
// Navigation). Trocar `accessToken` alterna a tela DENTRO deste native-stack, em
// vez de desmontar/remontar dois navegadores diferentes sob a NavigationContainer.
// Aquele swap (accessToken ? <BottomTabs/> : <AuthStack/>) era o que derrubava a
// HomeStack inteira ao expirar/deslogar a sessão e disparava o aviso
// "The screen 'Dashboard' was removed natively but didn't get removed from JS state".
// `animation: 'none'` mantém a troca instantânea que existia antes.
const Root = createNativeStackNavigator();

export default function RootNavigator() {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#8B1A2B" />
      </View>
    );
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      {accessToken ? (
        <Root.Screen name="App" component={BottomTabs} />
      ) : (
        <Root.Screen name="Auth" component={AuthStack} />
      )}
    </Root.Navigator>
  );
}
