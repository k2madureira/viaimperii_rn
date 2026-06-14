import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ForgotPasswordScreen from '../screens/auth/forgotPassword/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/login/LoginScreen';
import SignupScreen from '../screens/auth/signup/SignupScreen';
import SpecialtyQuizScreen from '../screens/defaults/SpecialtyQuizScreen';
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
