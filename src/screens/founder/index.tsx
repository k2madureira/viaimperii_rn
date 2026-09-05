import React, { useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Text from '../../components/text';
import TextInput from '../../components/textInput';
import ScreenContainer from '../../components/screenContainer';
import { Navbar } from '../../components';
import { HomeNavigationProp } from '../../navigation/HomeStack';
import { FounderRedeemResponse } from '../../api/founder';
import { useRedeemFounder } from './model/mutations/useRedeemFounder';

export default function FounderRedeemScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();

  const [code, setCode] = useState('');
  const [result, setResult] = useState<FounderRedeemResponse | null>(null);

  const { mutate: redeem, isPending } = useRedeemFounder((data) => setResult(data));

  const onSubmit = () => {
    const trimmed = code.trim();
    if (!trimmed || isPending) return;
    redeem(trimmed);
  };

  return (
    <ScreenContainer>
      <Navbar />

      <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#f0f0f0]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-8 h-8 items-center justify-center -ml-1"
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}>
          <Text className="text-[24px] text-[#111] leading-none">‹</Text>
        </TouchableOpacity>
        <Text className="text-[16px] font-bold text-[#111] ml-1">{t('founder.redeemTitle')}</Text>
      </View>

      <View className="px-5 pt-6">
        {result ? (
          // Sucesso: virou Recruit IV + ganhou o Baú do Fundador; escolher trilha.
          <View className="bg-[#f6f1e7] border border-[#e6d9bf] rounded-[16px] p-6 items-center">
            <Text className="text-[19px] font-extrabold text-[#111] text-center">
              {t('founder.redeemSuccessTitle', { number: result.founder_number })}
            </Text>
            <View className="h-2.5" />
            <Text className="text-[13px] text-[#555] text-center leading-[20px]">
              {t('founder.redeemSuccessBody')}
            </Text>
            <View className="h-5" />
            <TouchableOpacity
              className="bg-primary-500 rounded-[10px] py-[14px] items-center w-full"
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Ranks')}>
              <Text className="text-white font-bold text-[15px]">{t('founder.chooseTrackCta')}</Text>
            </TouchableOpacity>
            <View className="h-2.5" />
            <TouchableOpacity
              className="py-[12px] items-center w-full"
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Chests')}>
              <Text className="text-primary-500 font-semibold text-[14px]">{t('chests.title')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-[13px] text-[#666] leading-[20px]">{t('founder.redeemHint')}</Text>
            <View className="h-4" />
            <TextInput
              className="border border-[#e0e0e0] rounded-[10px] px-[14px] py-[13px] text-sm text-[#111] bg-white tracking-[2px]"
              placeholder={t('founder.codePlaceholder')}
              placeholderTextColor="#bbb"
              autoCapitalize="characters"
              autoCorrect={false}
              value={code}
              onChangeText={setCode}
            />
            <View className="h-4" />
            <TouchableOpacity
              className={`rounded-[10px] py-[15px] items-center ${code.trim() ? 'bg-primary-500' : 'bg-[#d9b3ba]'}`}
              activeOpacity={0.85}
              disabled={!code.trim() || isPending}
              onPress={onSubmit}>
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-[15px]">{t('founder.redeemCta')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
