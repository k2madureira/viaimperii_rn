import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Navbar } from '../../../../../components';
import { WalletButton } from '../../../../dashboard/components';

interface Props {
  isOwnProfile: boolean;
  balance?: number;
}

// Navbar padrão no próprio perfil; seta de voltar ao visualizar outro usuário.
export default function ProfileTopBar({ isOwnProfile, balance }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  if (isOwnProfile) {
    return <Navbar rightExtra={balance != null ? <WalletButton balance={balance} /> : null} />;
  }

  return (
    <View className="flex-row items-center px-4 pt-5 pb-3 bg-white border-b border-[#f0f0f0]">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="pr-3"
        accessibilityLabel={t('common.back')}>
        <Text className="text-[24px] text-[#333] leading-none">‹</Text>
      </TouchableOpacity>
      <Text
        className="text-sm font-semibold text-[#111] tracking-[3px]"
        style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
        {t('nav.profile')}
      </Text>
    </View>
  );
}
