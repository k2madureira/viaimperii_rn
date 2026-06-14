import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Signup: { step?: number; email?: string } | undefined;
  ForgotPassword: undefined;
  SpecialtyQuiz: { testCode: string; userId: string };
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
