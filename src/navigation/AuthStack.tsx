import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ForgotPasswordScreen from '../screens/auth/forgotPassword';
import ResetPasswordScreen from '../screens/auth/forgotPassword/ResetPasswordScreen';
import LoginScreen from '../screens/auth/login';
import SignupScreen from '../screens/auth/signup';
import SpecialtyQuizScreen from '../screens/defaults/specialtyQuiz';
import FounderPreRegisterScreen from '../screens/auth/founderPreRegister';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="SpecialtyQuiz" component={SpecialtyQuizScreen} />
      <Stack.Screen name="FounderPreRegister" component={FounderPreRegisterScreen} />
    </Stack.Navigator>
  );
}
