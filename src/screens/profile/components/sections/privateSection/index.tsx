import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { KeyIcon, LogoutIcon } from '../../../../../navigation/icons/MenuIcons';
import { useAuth } from '../../../../../contexts/AuthContext';
import SectionLabel from '../../labels/sectionLabel';
import InfoRow from '../../cards/infoRow';

interface Props {
  onChangePassword: () => void;
}

// Seção privada — somente no próprio perfil.
export default function PrivateSection({ onChangePassword }: Props) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  return (
    <View>
      <SectionLabel text={t('profile.privateSection')} />
      <View className="bg-white border border-[#f0eded] rounded-[16px] overflow-hidden mb-3">
        <InfoRow label="E-mail" value={user?.email ?? '—'} last />
      </View>

      <TouchableOpacity
        onPress={onChangePassword}
        activeOpacity={0.85}
        className="flex-row items-center justify-center gap-2 bg-white border border-[#f0eded] rounded-[14px] py-3.5 mb-3">
        <KeyIcon size={18} color="#1f1f1f" />
        <Text className="text-[14px] font-bold text-charcoal">{t('profile.changePassword')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => signOut()}
        activeOpacity={0.85}
        className="flex-row items-center justify-center gap-2 bg-primary-500 rounded-[14px] py-3.5">
        <LogoutIcon size={18} color="#ffffff" />
        <Text className="text-[14px] font-bold text-white">{t('profile.signOut')}</Text>
      </TouchableOpacity>
    </View>
  );
}
