import { useForm } from '@tanstack/react-form';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthNavigationProp } from '../../../../../navigation/types';
import EyeIcon from '../../../components/icons/EyeIcon';
import EyeOffIcon from '../../../components/icons/EyeOffIcon';
import { loginSchema } from '../../model/contracts/loginSchema';
import { useLoginMutation } from '../../model/mutations/useLoginMutation';
import SocialLogin from './SocialLogin';

export default function LoginForm() {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthNavigationProp>();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputPaddingVertical = Platform.OS === 'ios' ? 13 : 10;

  const { mutate: login, isPending } = useLoginMutation((email) => {
    navigation.navigate('Signup', { step: 3, email });
  });

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      login(value);
    },
  });

  return (
    <View>
      <form.Field name="email">
        {(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <View>
              <TextInput
                className={`border rounded-[10px] px-[14px] text-sm text-[#111] bg-white ${hasError ? 'border-red-400' : 'border-[#e0e0e0]'}`}
                style={{ paddingVertical: inputPaddingVertical }}
                placeholder={t('auth.login.emailPlaceholder')}
                placeholderTextColor="#bbb"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
              />
              {hasError && (
                <Text className="text-red-400 text-[11px] mt-1 ml-1">
                  {field.state.meta.errors[0]?.message}
                </Text>
              )}
            </View>
          );
        }}
      </form.Field>

      <View className="h-2.5" />

      <form.Field name="password">
        {(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <View>
              <View className={`flex-row items-center border rounded-[10px] bg-white ${hasError ? 'border-red-400' : 'border-[#e0e0e0]'}`}>
                <TextInput
                  className="flex-1 px-[14px] text-sm text-[#111]"
                  style={{ paddingVertical: inputPaddingVertical }}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  placeholderTextColor="#bbb"
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(v => !v)}
                  className="px-3"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {passwordVisible ? <EyeIcon /> : <EyeOffIcon />}
                </TouchableOpacity>
              </View>
              {hasError && (
                <Text className="text-red-400 text-[11px] mt-1 ml-1">
                  {field.state.meta.errors[0]?.message}
                </Text>
              )}
            </View>
          );
        }}
      </form.Field>

      <View className="h-1.5" />

      <View className="items-end">
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text className="text-primary-500 text-[13px] font-medium">
            {t('auth.login.forgotPassword')}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="h-5" />

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <TouchableOpacity
            className="bg-primary-500 rounded-[10px] py-[15px] items-center"
            activeOpacity={0.85}
            disabled={isSubmitting || isPending}
            onPress={form.handleSubmit}>
            {isSubmitting || isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-[15px] font-bold tracking-[0.4px]">
                {t('auth.login.submit')}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </form.Subscribe>

      <View className="h-3.5" />

      <View className="flex-row justify-center items-center">
        <Text className="text-[13px] text-[#555]">{t('auth.login.noAccount')} </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text className="text-[13px] text-primary-500 font-semibold">{t('auth.login.signup')}</Text>
        </TouchableOpacity>
      </View>

      <SocialLogin />
    </View>
  );
}
