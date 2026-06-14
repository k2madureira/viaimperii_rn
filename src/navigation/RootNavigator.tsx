import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AppDrawer from './AppDrawer';
import AuthStack from './AuthStack';

export default function RootNavigator() {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#8B1A2B" />
      </View>
    );
  }

  return accessToken ? <AppDrawer /> : <AuthStack />;
}
