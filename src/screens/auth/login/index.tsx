import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Text from '../../../components/text';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from '../../../components';
import AuthContainer from '../components/AuthContainer';
import LoginForm from './components/form/Form';
import { AuthNavigationProp } from '../../../navigation/types';

export default function LoginScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthNavigationProp>();

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

      <View className="h-4" />
      <View className="items-center">
        <TouchableOpacity onPress={() => navigation.navigate('FounderPreRegister')}>
          <Text className="text-[13px] text-primary-500 font-semibold">
            {t('founder.preRegisterCta')}
          </Text>
        </TouchableOpacity>
      </View>

    </AuthContainer>
  );
}
