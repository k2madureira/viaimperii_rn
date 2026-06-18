import { useRoute, RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from '../../../components';
import AuthContainer from '../components/AuthContainer';
import { AuthStackParamList } from '../../../navigation/types';
import Step1Form from './components/steps/Step1Form';
import Step2Info from './components/steps/Step2Info';
import Step3Token from './components/steps/Step3Token';

type Step = 1 | 2 | 3;
type SignupRoute = RouteProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const { t } = useTranslation();
  const route = useRoute<SignupRoute>();
  const params = route.params;

  const [step, setStep] = useState<Step>((params?.step as Step) ?? 1);
  const [email, setEmail] = useState(params?.email ?? '');

  const handleStep1Success = (registeredEmail: string) => {
    setEmail(registeredEmail);
    setStep(2);
  };

  const handleHasCode = (currentEmail: string) => {
    setEmail(currentEmail);
    setStep(3);
  };

  return (
    <AuthContainer>
      <LogoIcon size={40} color="#111" />
      <View className="h-1.5" />
      <Text
        className="text-sm font-semibold text-center text-[#111] tracking-[6px]"
        style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
        {t('common.appName')}
      </Text>

      <View className="h-5" />

      {step === 1 && (
        <>
          <Text className="text-[20px] font-extrabold text-center text-[#111] leading-[38px]">
            {t('auth.signup.tagline')}
          </Text>
          <View className="h-6" />
          <Step1Form onSuccess={handleStep1Success} onHasCode={handleHasCode} />
        </>
      )}

      {step === 2 && (
        <>
          <View className="h-2" />
          <Step2Info email={email} onContinue={() => setStep(3)} />
        </>
      )}

      {step === 3 && (
        <>
          <View className="h-2" />
          <Step3Token email={email} onBack={() => setStep(2)} />
        </>
      )}
    </AuthContainer>
  );
}
