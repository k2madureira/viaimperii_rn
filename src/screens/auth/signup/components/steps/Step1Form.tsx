import { useForm } from '@tanstack/react-form';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthNavigationProp } from '../../../../../navigation/types';
import { signupSimpleSchema } from '../../model/contracts/signupSchema';
import { useSignupMutation } from '../../model/mutations/useSignupMutation';

interface Props {
  onSuccess: (email: string) => void;
  onHasCode: (currentEmail: string) => void;
}

export default function Step1Form({ onSuccess, onHasCode }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthNavigationProp>();
  const inputPaddingVertical = Platform.OS === 'ios' ? 13 : 10;

  const { mutate: createUser, isPending } = useSignupMutation(() => {
    /* onSuccess chamado em onSubmit para ter acesso ao email */
  });

  const form = useForm({
    defaultValues: { name: '', email: '' },
    validators: { onSubmit: signupSimpleSchema },
    onSubmit: async ({ value }) => {
      createUser(
        { name: value.name, email: value.email },
        { onSuccess: () => onSuccess(value.email) },
      );
    },
  });

  return (
    <View>
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
                {t('auth.signup.continue')}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </form.Subscribe>

      <View className="h-3" />

      <TouchableOpacity
        className="items-center"
        onPress={() => onHasCode(form.state.values.email)}>
        <Text className="text-[13px] text-[#888]">
          {t('auth.signup.hasCode')}
        </Text>
      </TouchableOpacity>

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
