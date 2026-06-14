import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LoginFormData, loginSchema } from '../../model/contracts/loginSchema';
import { useLoginMutation } from '../../model/mutations/useLoginMutation';

export default function LoginForm() {
  const { t } = useTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputPaddingVertical = Platform.OS === 'ios' ? 13 : 10;

  const { mutate: login, isPending } = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <View>
            <TextInput
              className={`border rounded-[10px] px-[14px] text-sm text-[#111] bg-white ${errors.email ? 'border-red-400' : 'border-[#e0e0e0]'}`}
              style={{ paddingVertical: inputPaddingVertical }}
              placeholder={t('auth.login.emailPlaceholder')}
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
            {errors.email && (
              <Text className="text-red-400 text-[11px] mt-1 ml-1">{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      <View className="h-2.5" />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <View>
            <View className={`flex-row items-center border rounded-[10px] bg-white ${errors.password ? 'border-red-400' : 'border-[#e0e0e0]'}`}>
              <TextInput
                className="flex-1 px-[14px] text-sm text-[#111]"
                style={{ paddingVertical: inputPaddingVertical }}
                placeholder={t('auth.login.passwordPlaceholder')}
                placeholderTextColor="#bbb"
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(v => !v)}
                className="px-3"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text className="text-base opacity-45">{passwordVisible ? '👁' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-red-400 text-[11px] mt-1 ml-1">{errors.password.message}</Text>
            )}
          </View>
        )}
      />

      <View className="h-1.5" />

      <View className="items-end">
        <TouchableOpacity>
          <Text className="text-primary text-[13px] font-medium">
            {t('auth.login.forgotPassword')}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="h-5" />

      <TouchableOpacity
        className="bg-primary rounded-[10px] py-[15px] items-center"
        activeOpacity={0.85}
        disabled={isPending}
        onPress={handleSubmit(onSubmit)}>
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-[15px] font-bold tracking-[0.4px]">
            {t('auth.login.submit')}
          </Text>
        )}
      </TouchableOpacity>

      <View className="h-3.5" />

      <View className="flex-row justify-center items-center">
        <Text className="text-[13px] text-[#555]">{t('auth.login.noAccount')} </Text>
        <TouchableOpacity>
          <Text className="text-[13px] text-primary font-semibold">{t('auth.login.signup')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
