import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from '../../../components';
import AuthContainer from '../components/AuthContainer';
import ForgotPasswordForm from './components/form/Form';

export default function ForgotPasswordScreen() {
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
      <Text className="text-[20px] font-extrabold text-center text-[#111] leading-[28px]">
        {t('auth.forgotPassword.tagline')}
      </Text>
      <View className="h-2" />
      <Text className="text-[13px] text-center text-[#888]">
        {t('auth.forgotPassword.description')}
      </Text>
      <View className="h-6" />

      <ForgotPasswordForm />
    </AuthContainer>
  );
}
