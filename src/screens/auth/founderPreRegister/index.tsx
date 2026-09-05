import React, { useState } from 'react';
import { ActivityIndicator, Platform, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Text from '../../../components/text';
import TextInput from '../../../components/textInput';
import { LogoIcon } from '../../../components';
import AuthContainer from '../components/AuthContainer';
import { AuthNavigationProp } from '../../../navigation/types';
import { useFounderAvailability } from './model/queries/useFounderAvailability';
import { usePreRegisterFounder } from './model/mutations/usePreRegisterFounder';

const FOUNDER_SEATS_TOTAL = 100;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FounderPreRegisterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthNavigationProp>();
  const inputPaddingVertical = Platform.OS === 'ios' ? 13 : 10;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);

  const availabilityQuery = useFounderAvailability();
  const availability = availabilityQuery.data;
  const enrollmentOpen = availability?.enrollment_open ?? true;

  const { mutate: preRegister, isPending } = usePreRegisterFounder((data) => setSentTo(data.email));

  const emailValid = EMAIL_RE.test(email.trim());

  const onSubmit = () => {
    if (!emailValid || isPending) return;
    preRegister({ email: email.trim(), name: name.trim() || undefined });
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
      <Text className="text-[20px] font-extrabold text-center text-[#111] leading-[30px]">
        {t('founder.preRegisterTitle')}
      </Text>
      <View className="h-1.5" />
      <Text className="text-[13px] text-center text-[#666] leading-[20px]">
        {t('founder.preRegisterTagline')}
      </Text>

      <View className="h-4" />

      {sentTo ? (
        // Estado de sucesso: código enviado por e-mail.
        <View className="bg-[#f6f1e7] border border-[#e6d9bf] rounded-[14px] p-5 items-center">
          <Text className="text-[16px] font-bold text-[#111] text-center">
            {t('founder.preRegisterSuccessTitle')}
          </Text>
          <View className="h-2" />
          <Text className="text-[13px] text-[#555] text-center leading-[20px]">
            {t('founder.preRegisterSuccessBody', { email: sentTo })}
          </Text>
          <View className="h-4" />
          <TouchableOpacity
            className="bg-primary-500 rounded-[10px] py-[14px] items-center w-full"
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Signup', { email: sentTo })}>
            <Text className="text-white font-bold text-[15px]">{t('founder.createAccountCta')}</Text>
          </TouchableOpacity>
        </View>
      ) : !enrollmentOpen ? (
        <View className="bg-[#faf0f0] border border-[#f0d5d5] rounded-[14px] p-5">
          <Text className="text-[13px] text-[#8B1A2B] text-center leading-[20px]">
            {t('founder.enrollmentClosed')}
          </Text>
        </View>
      ) : (
        <View>
          {/* Vagas restantes */}
          {availability ? (
            <View className="items-center mb-4">
              <Text className="text-[13px] font-semibold text-[#8B1A2B]">
                {t('founder.seatsRemaining', {
                  count: availability.seats_remaining,
                  total: FOUNDER_SEATS_TOTAL,
                })}
              </Text>
            </View>
          ) : availabilityQuery.isLoading ? (
            <View className="items-center mb-4">
              <ActivityIndicator color="#9E1B32" />
            </View>
          ) : null}

          <TextInput
            className="border border-[#e0e0e0] rounded-[10px] px-[14px] text-sm text-[#111] bg-white"
            style={{ paddingVertical: inputPaddingVertical }}
            placeholder={t('founder.namePlaceholder')}
            placeholderTextColor="#bbb"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <View className="h-2.5" />
          <TextInput
            className="border border-[#e0e0e0] rounded-[10px] px-[14px] text-sm text-[#111] bg-white"
            style={{ paddingVertical: inputPaddingVertical }}
            placeholder={t('founder.emailPlaceholder')}
            placeholderTextColor="#bbb"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <View className="h-2" />
          <Text className="text-[11px] text-[#999] leading-[16px] ml-1">
            {t('founder.sameEmailWarning')}
          </Text>

          <View className="h-4" />
          <TouchableOpacity
            className={`rounded-[10px] py-[15px] items-center ${emailValid ? 'bg-primary-500' : 'bg-[#d9b3ba]'}`}
            activeOpacity={0.85}
            disabled={!emailValid || isPending}
            onPress={onSubmit}>
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-[15px]">{t('founder.preRegisterCta')}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View className="h-5" />
      <View className="items-center">
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text className="text-[13px] text-[#666] font-medium">{t('founder.backToLogin')}</Text>
        </TouchableOpacity>
      </View>
    </AuthContainer>
  );
}
