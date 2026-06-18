import 'react-native-gesture-handler';
import './global.css';
import './src/i18n';
import { enableScreens } from 'react-native-screens';
import React, { useState, useCallback } from 'react';

enableScreens();
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/defaults/splash';

const queryClient = new QueryClient();

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            {!splashDone ? (
              <SplashScreen onFinish={handleSplashFinish} />
            ) : (
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            )}
            <Toast />
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
