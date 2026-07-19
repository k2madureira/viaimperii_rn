import { useForm } from '@tanstack/react-form';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import TextInput from '../../../../../components/textInput';
import { AuthNavigationProp } from '../../../../../navigation/types';
import EyeIcon from '../../../components/icons/EyeIcon';
import EyeOffIcon from '../../../components/icons/EyeOffIcon';
import { resetPasswordSchema } from '../../model/contracts/resetPasswordSchema';
import { useResetPasswordMutation } from '../../model/mutations/useResetPasswordMutation';

const inputPaddingVertical = Platform.OS === 'ios' ? 13 : 10;

function PasswordField({
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: () => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <View>
      <View
        className={`flex-row items-center border rounded-[10px] bg-white ${error ? 'border-red-400' : 'border-[#e0e0e0]'}`}>
        <TextInput
          className="flex-1 px-[14px] text-sm text-[#111]"
          style={{ paddingVertical: inputPaddingVertical }}
          placeholder={placeholder}
          placeholderTextColor="#bbb"
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
        />
        <TouchableOpacity
          onPress={() => setShow(v => !v)}
          className="px-3"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {show ? <EyeIcon /> : <EyeOffIcon />}
        </TouchableOpacity>
      </View>
      {error && <Text className="text-red-400 text-[11px] mt-1 ml-1">{error}</Text>}
    </View>
  );
}

export default function ResetPasswordForm() {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthNavigationProp>();

  const { mutate: resetPassword, isPending } = useResetPasswordMutation(() =>
    navigation.navigate('Login'),
  );

  const form = useForm({
    defaultValues: { token: '', new_password: '', confirm_password: '' },
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      resetPassword({ token: value.token.trim(), newPassword: value.new_password });
    },
  });

  return (
    <View>
      <form.Field name="token">
        {(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <View className="mb-3">
              <TextInput
                className={`border rounded-[10px] px-[14px] text-sm text-[#111] bg-white ${hasError ? 'border-red-400' : 'border-[#e0e0e0]'}`}
                style={{ paddingVertical: inputPaddingVertical }}
                placeholder={t('auth.resetPassword.tokenPlaceholder')}
                placeholderTextColor="#bbb"
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

      <form.Field name="new_password">
        {(field) => (
          <View className="mb-3">
            <PasswordField
              placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
            />
          </View>
        )}
      </form.Field>

      <form.Field name="confirm_password">
        {(field) => (
          <PasswordField
            placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
            value={field.state.value}
            onChangeText={field.handleChange}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
          />
        )}
      </form.Field>

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
                {t('auth.resetPassword.submit')}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </form.Subscribe>

      <View className="h-3.5" />

      <View className="flex-row justify-center items-center">
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text className="text-[13px] text-primary-500 font-semibold">
            {t('auth.forgotPassword.backToLogin')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
