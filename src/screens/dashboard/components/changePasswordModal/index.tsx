import { useForm } from '@tanstack/react-form';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import EyeIcon from '../../../auth/components/icons/EyeIcon';
import EyeOffIcon from '../../../auth/components/icons/EyeOffIcon';
import { changePasswordSchema } from '../../model/contracts/changePasswordSchema';
import { useUpdatePasswordMutation } from '../../model/mutations/useUpdatePasswordMutation';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

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
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={isTemporary ? undefined : onClose}>
      {/* Backdrop instantâneo — sem animação */}
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Sheet animado */}
          <Animated.View
            className="bg-white rounded-t-[20px] px-6 pt-5 pb-10"
            style={{ transform: [{ translateY: slideAnim }] }}>

            <View className="items-center mb-4">
              <View className="w-10 h-1 bg-[#ddd] rounded-full" />
            </View>

            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-1 pr-4">
                <Text className="text-[18px] font-extrabold text-[#111]">
                  {isTemporary ? 'Defina sua senha' : 'Alterar senha'}
                </Text>
                {isTemporary && (
                  <Text className="text-[12px] text-[#888] mt-1 leading-[18px]">
                    Você está com uma senha temporária. Crie uma senha permanente para continuar.
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
                  label={isTemporary ? 'Senha temporária' : 'Senha atual'}
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
                  label="Nova senha"
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
                  label="Confirmar nova senha"
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
                  className="bg-primary rounded-[10px] py-[15px] items-center"
                  activeOpacity={0.85}
                  disabled={isSubmitting || isPending}
                  onPress={form.handleSubmit}>
                  {isSubmitting || isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-[15px] font-bold tracking-[0.4px]">
                      {isTemporary ? 'Definir senha' : 'Atualizar senha'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </form.Subscribe>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
