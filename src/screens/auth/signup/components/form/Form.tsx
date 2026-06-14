import { useForm } from '@tanstack/react-form';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthNavigationProp } from '../../../../../navigation/types';
import EyeIcon from '../../../components/icons/EyeIcon';
import EyeOffIcon from '../../../components/icons/EyeOffIcon';
import {
  signupSimpleSchema,
  signupWithPasswordSchema,
  SignupSimpleData,
  SignupWithPasswordData,
} from '../../model/contracts/signupSchema';
import { useSignupMutation } from '../../model/mutations/useSignupMutation';

export default function SignupForm() {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthNavigationProp>();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [createPassword, setCreatePassword] = useState(false);
  const inputPaddingVertical = Platform.OS === 'ios' ? 13 : 10;

  const { mutate: createUser, isPending } = useSignupMutation();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      invite_code: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: createPassword ? signupWithPasswordSchema : signupSimpleSchema,
    },
    onSubmit: async ({ value }) => {
      const payload: Parameters<typeof createUser>[0] = {
        name: value.name,
        email: value.email,
      };
      if (value.invite_code) payload.invite_code = value.invite_code;
      if (createPassword) payload.password = (value as SignupWithPasswordData).password;
      createUser(payload);
    },
  });

  return (
    <View>
      {/* Nome */}
      <form.Field name="name">
        {(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <View>
              <TextInput
                className={`border rounded-[10px] px-[14px] text-sm text-[#111] bg-white ${hasError ? 'border-red-400' : 'border-[#e0e0e0]'}`}
                style={{ paddingVertical: inputPaddingVertical }}
                placeholder={t('auth.signup.namePlaceholder')}
                placeholderTextColor="#bbb"
                autoCapitalize="words"
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

      {/* Email */}
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

      <View className="h-2" />

      {/* Toggle código de convite */}
      {!showInviteCode ? (
        <TouchableOpacity onPress={() => setShowInviteCode(true)}>
          <Text className="text-primary text-[13px] font-medium">
            + {t('auth.signup.addInviteCode')}
          </Text>
        </TouchableOpacity>
      ) : (
        <form.Field name="invite_code">
          {(field) => (
            <View>
              <TextInput
                className="border border-[#e0e0e0] rounded-[10px] px-[14px] text-sm text-[#111] bg-white"
                style={{ paddingVertical: inputPaddingVertical }}
                placeholder={t('auth.signup.inviteCodePlaceholder')}
                placeholderTextColor="#bbb"
                autoCapitalize="characters"
                autoCorrect={false}
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
              />
            </View>
          )}
        </form.Field>
      )}

      <View className="h-3" />

      {/* Toggle criar senha */}
      <TouchableOpacity
        onPress={() => setCreatePassword(v => !v)}
        className="flex-row items-center gap-2">
        <View
          className={`w-4 h-4 rounded border ${createPassword ? 'bg-primary border-primary' : 'border-[#ccc] bg-white'} items-center justify-center`}>
          {createPassword && <Text className="text-white text-[10px] font-bold">✓</Text>}
        </View>
        <Text className="text-[13px] text-[#444]">{t('auth.signup.createPassword')}</Text>
      </TouchableOpacity>

      {createPassword && (
        <View className="mt-3">
          {/* Senha */}
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

          <View className="h-2.5" />

          {/* Confirmar senha */}
          <form.Field name="confirmPassword">
            {(field) => {
              const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
              return (
                <View>
                  <View className={`flex-row items-center border rounded-[10px] bg-white ${hasError ? 'border-red-400' : 'border-[#e0e0e0]'}`}>
                    <TextInput
                      className="flex-1 px-[14px] text-sm text-[#111]"
                      style={{ paddingVertical: inputPaddingVertical }}
                      placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                      placeholderTextColor="#bbb"
                      secureTextEntry={!confirmPasswordVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                    />
                    <TouchableOpacity
                      onPress={() => setConfirmPasswordVisible(v => !v)}
                      className="px-3"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      {confirmPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
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
        </View>
      )}

      {!createPassword && (
        <Text className="text-[11px] text-[#888] mt-2">{t('auth.signup.tempPasswordNote')}</Text>
      )}

      <View className="h-5" />

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <TouchableOpacity
            className="bg-primary rounded-[10px] py-[15px] items-center"
            activeOpacity={0.85}
            disabled={isSubmitting || isPending}
            onPress={form.handleSubmit}>
            {isSubmitting || isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-[15px] font-bold tracking-[0.4px]">
                {t('auth.signup.submit')}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </form.Subscribe>

      <Text className="text-[11px] text-[#888] text-center mt-2">
        {t('auth.signup.testCodeNote')}
      </Text>

      <View className="h-3.5" />

      <View className="flex-row justify-center items-center">
        <Text className="text-[13px] text-[#555]">{t('auth.signup.hasAccount')} </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text className="text-[13px] text-primary font-semibold">{t('auth.signup.signin')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
