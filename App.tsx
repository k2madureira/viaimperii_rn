import './global.css';
import './src/i18n';
import React, { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import SplashScreen from './src/screens/defaults/SplashScreen';
import LoginScreen from './src/screens/auth/login/LoginScreen';

const queryClient = new QueryClient();

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        {!splashDone ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : (
          <LoginScreen />
        )}
        <Toast />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
