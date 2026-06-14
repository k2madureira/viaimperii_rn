import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import GithubIcon from '../../../components/icons/GithubIcon';
import GoogleIcon from '../../../components/icons/GoogleIcon';
import { useGithubAuth, useGoogleAuth } from '../../model/mutations/useOAuthMutation';

export default function SocialLogin() {
  const { t } = useTranslation();
  const google = useGoogleAuth();
  const github = useGithubAuth();

  return (
    <View>
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-[#e0e0e0]" />
        <Text className="mx-3 text-[12px] text-[#aaa]">{t('auth.login.orContinueWith')}</Text>
        <View className="flex-1 h-px bg-[#e0e0e0]" />
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center border border-[#e0e0e0] rounded-[10px] py-[13px] gap-2"
          activeOpacity={0.7}
          disabled={google.disabled}
          onPress={() => google.promptAsync()}>
          <GoogleIcon />
          <Text className="text-[14px] font-medium text-[#111]">Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center border border-[#e0e0e0] rounded-[10px] py-[13px] gap-2"
          activeOpacity={0.7}
          disabled={github.disabled}
          onPress={() => github.promptAsync()}>
          <GithubIcon />
          <Text className="text-[14px] font-medium text-[#111]">GitHub</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
