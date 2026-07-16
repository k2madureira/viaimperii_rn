import React from 'react';
import { Platform, View } from 'react-native';
import Text from '../../../components/text';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from '../../../components';
import AuthContainer from '../components/AuthContainer';
import ResetPasswordForm from './components/form/ResetForm';

export default function ResetPasswordScreen() {
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
        {t('auth.resetPassword.tagline')}
      </Text>
      <View className="h-2" />
      <Text className="text-[13px] text-center text-[#888]">
        {t('auth.resetPassword.description')}
      </Text>
      <View className="h-6" />

      <ResetPasswordForm />
    </AuthContainer>
  );
}
