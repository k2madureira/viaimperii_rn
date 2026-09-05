import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Signup: { step?: number; email?: string } | undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string } | undefined;
  SpecialtyQuiz: { testCode: string; userId: string };
  FounderPreRegister: undefined;
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
