import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getQuizQuestions } from '../../../../../api/quiz/specialtyQuizApi';
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthNavigationProp } from '../../../../../navigation/types';
import { useVerifyTokenMutation } from '../../model/mutations/useVerifyTokenMutation';

interface Props {
  email: string;
  onBack: () => void;
}

const TOKEN_LENGTH = 7;

export default function Step3Token({ email: initialEmail, onBack }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthNavigationProp>();
  const inputPaddingVertical = Platform.OS === 'ios' ? 13 : 10;
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState('');
  const tokenInputRef = useRef<TextInput>(null);

  const canSubmit = email.trim().length > 0 && token.trim().length >= TOKEN_LENGTH;

  const queryClient = useQueryClient();

  const { mutate: verify, isPending } = useVerifyTokenMutation(async ({ user_id }) => {
    const testCode = token.trim().toUpperCase();
    await queryClient.prefetchQuery({
      queryKey: ['specialty-quiz', testCode],
      queryFn: () => getQuizQuestions(testCode),
    });
    navigation.navigate('SpecialtyQuiz', { testCode, userId: user_id });
  });

  const handleVerify = () => {
    if (!canSubmit) return;
    verify({ email: email.trim(), test_code: token.trim().toUpperCase() });
  };

  return (
    <View>
      <Text className="text-[20px] font-extrabold text-center text-[#111] leading-[28px]">
        {t('auth.signup.step3Title')}
      </Text>

      <View className="h-3" />

      <Text className="text-[14px] text-center text-[#555] leading-[22px]">
        {email
          ? t('auth.signup.step3Description', { email })
          : t('auth.signup.step3DescriptionNoEmail')}
      </Text>

      <View className="h-8" />

      {/* Campo de email — visível quando veio pelo atalho "Já possui o código?" */}
      {!initialEmail && (
        <>
          <TextInput
            className="border border-[#e0e0e0] rounded-[10px] px-[14px] text-sm text-[#111] bg-white"
            style={{ paddingVertical: inputPaddingVertical }}
            placeholder={t('auth.login.emailPlaceholder')}
            placeholderTextColor="#bbb"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={() => tokenInputRef.current?.focus()}
          />
          <View className="h-3" />
        </>
      )}

      {/* Campo do código */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => tokenInputRef.current?.focus()}>
        <TextInput
          ref={tokenInputRef}
          className="border border-[#e0e0e0] rounded-[10px] px-[14px] text-[#111] bg-white text-center tracking-[6px] font-bold"
          style={{ paddingVertical: inputPaddingVertical, fontSize: 20 }}
          placeholder={t('auth.signup.tokenPlaceholder')}
          placeholderTextColor="#bbb"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={TOKEN_LENGTH}
          value={token}
          onChangeText={(v) => setToken(v.toUpperCase())}
          onSubmitEditing={handleVerify}
          returnKeyType="done"
        />
      </TouchableOpacity>

      <View className="h-5" />

      <TouchableOpacity
        className={`rounded-[10px] py-[15px] items-center ${canSubmit ? 'bg-primary' : 'bg-[#ccc]'}`}
        activeOpacity={0.85}
        disabled={isPending || !canSubmit}
        onPress={handleVerify}>
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-[15px] font-bold tracking-[0.4px]">
            {t('auth.signup.verifyToken')}
          </Text>
        )}
      </TouchableOpacity>

      <View className="h-4" />

      <TouchableOpacity onPress={onBack} className="items-center">
        <Text className="text-[13px] text-[#888]">{t('auth.signup.backToEmail')}</Text>
      </TouchableOpacity>
    </View>
  );
}
