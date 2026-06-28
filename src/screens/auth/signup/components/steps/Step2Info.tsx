import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  email: string;
  onContinue: () => void;
}

function MailSentIcon() {
  return (
    <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6Z"
        stroke="#8B1A2B"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 6L12 13L2 6"
        stroke="#8B1A2B"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={17} cy={8} r={4} fill="#8B1A2B" />
      <Path d="M15.5 8L16.5 9L18.5 7" stroke="white" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function Step2Info({ email, onContinue }: Props) {
  const { t } = useTranslation();

  return (
    <View className="items-center">
      <MailSentIcon />

      <View className="h-5" />

      <Text className="text-[20px] font-extrabold text-center text-[#111] leading-[28px]">
        {t('auth.signup.step2Title')}
      </Text>

      <View className="h-3" />

      <Text className="text-[14px] text-center text-[#555] leading-[22px]">
        {t('auth.signup.step2Description', { email })}
      </Text>

      <View className="h-2" />

      <Text className="text-[13px] text-center text-[#888] leading-[20px]">
        {t('auth.signup.step2Hint')}
      </Text>

      <View className="h-8" />

      <TouchableOpacity
        className="bg-primary-500 rounded-[10px] py-[15px] items-center w-full"
        activeOpacity={0.85}
        onPress={onContinue}>
        <Text className="text-white text-[15px] font-bold tracking-[0.4px]">
          {t('auth.signup.step2Continue')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
