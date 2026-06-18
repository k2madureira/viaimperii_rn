import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from '../../../components';
import AuthContainer from '../components/AuthContainer';
import LoginForm from './components/form/Form';

export default function LoginScreen() {
  const { t } = useTranslation();

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
      <Text className="text-[20px] font-extrabold text-center text-[#111] leading-[38px]">
        {t('auth.login.tagline')}
      </Text>
      <View className="h-6" />

      <LoginForm />

    </AuthContainer>
  );
}
