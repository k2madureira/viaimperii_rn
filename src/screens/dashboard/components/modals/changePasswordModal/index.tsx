import { useForm } from '@tanstack/react-form';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from '../../../../../components/text';
import TextInput from '../../../../../components/textInput';
import EyeIcon from '../../../../auth/components/icons/EyeIcon';
import EyeOffIcon from '../../../../auth/components/icons/EyeOffIcon';
import { changePasswordSchema } from '../../../model/contracts/changePasswordSchema';
import { useUpdatePasswordMutation } from '../../../model/mutations/useUpdatePasswordMutation';

interface Props {
  visible: boolean;
  isTemporary?: boolean;
  onClose: () => void;
}

function PasswordField({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: () => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const py = Platform.OS === 'ios' ? 13 : 10;

  return (
    <View className="mb-3">
      <Text className="text-[12px] text-[#666] font-medium mb-1">{label}</Text>
      <View
        className={`flex-row items-center border rounded-[10px] bg-white ${error ? 'border-red-400' : 'border-[#e0e0e0]'}`}>
        <TextInput
          className="flex-1 px-[14px] text-sm text-[#111]"
          style={{ paddingVertical: py }}
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

export default function ChangePasswordModal({ visible, isTemporary = false, onClose }: Props) {
  const { t } = useTranslation();

  const { mutate: updatePassword, isPending } = useUpdatePasswordMutation(onClose);

  const form = useForm({
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      updatePassword({ current_password: value.current_password, new_password: value.new_password });
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={isTemporary ? undefined : onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <KeyboardAvoidingView
          className="w-full"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="w-full bg-white rounded-[20px] p-6">

            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-1 pr-4">
                <Text className="text-[18px] font-extrabold text-[#111]">
                  {isTemporary ? t('changePassword.setTitle') : t('changePassword.changeTitle')}
                </Text>
                {isTemporary && (
                  <Text className="text-[12px] text-[#888] mt-1 leading-[18px]">
                    {t('changePassword.temporaryNotice')}
                  </Text>
                )}
              </View>
              {!isTemporary && (
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Text className="text-[26px] text-[#bbb] leading-none">×</Text>
                </TouchableOpacity>
              )}
            </View>

            <form.Field name="current_password">
              {(field) => (
                <PasswordField
                  label={isTemporary ? t('changePassword.temporaryPasswordLabel') : t('changePassword.currentPasswordLabel')}
                  placeholder="••••••••"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
                />
              )}
            </form.Field>

            <form.Field name="new_password">
              {(field) => (
                <PasswordField
                  label={t('changePassword.newPasswordLabel')}
                  placeholder="••••••••"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
                />
              )}
            </form.Field>

            <form.Field name="confirm_password">
              {(field) => (
                <PasswordField
                  label={t('changePassword.confirmNewPasswordLabel')}
                  placeholder="••••••••"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
                />
              )}
            </form.Field>

            <View className="h-2" />

            <form.Subscribe selector={(s) => s.isSubmitting}>
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
                      {isTemporary ? t('changePassword.setButton') : t('changePassword.updateButton')}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </form.Subscribe>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
