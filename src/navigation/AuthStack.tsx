import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ForgotPasswordScreen from '../screens/auth/forgotPassword';
import LoginScreen from '../screens/auth/login';
import SignupScreen from '../screens/auth/signup';
import SpecialtyQuizScreen from '../screens/defaults/specialtyQuiz';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SpecialtyQuiz" component={SpecialtyQuizScreen} />
    </Stack.Navigator>
  );
}
