import { useForm } from '@tanstack/react-form';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthNavigationProp } from '../../../../../navigation/types';
import { forgotPasswordSchema } from '../../model/contracts/forgotPasswordSchema';
import { useForgotPasswordMutation } from '../../model/mutations/useForgotPasswordMutation';

export default function ForgotPasswordForm() {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthNavigationProp>();
  const inputPaddingVertical = Platform.OS === 'ios' ? 13 : 10;

  const { mutate: sendEmail, isPending } = useForgotPasswordMutation();

  const form = useForm({
    defaultValues: { email: '' },
    validators: { onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      sendEmail(value.email);
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
                {t('auth.forgotPassword.submit')}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </form.Subscribe>

      <View className="h-3.5" />

      <View className="flex-row justify-center items-center">
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text className="text-[13px] text-primary font-semibold">
            {t('auth.forgotPassword.backToLogin')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
