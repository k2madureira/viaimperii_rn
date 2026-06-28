import React, { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChangePasswordModal } from '../../screens/dashboard/components';
import LogoIcon from '../logoIcon';
import UserMenu from '../userMenu';
 
/**
 * Navbar usada nas telas internas (Missions, Ranking, etc.):
 * logo + nome do app à esquerda, UserMenu à direita.
 * A navegação principal agora é a bottom tab bar — sem botão de menu/drawer.
 */
export default function Navbar() {
  const { t } = useTranslation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <View className="flex-row items-center justify-between px-4 pt-5 pb-3 bg-white border-b border-[#f0f0f0]">
        <View className="flex-row items-center">
          <LogoIcon size={22} color="#9E1B32" />
          <Text
            className="text-sm font-semibold text-[#111] tracking-[3px] ml-2"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {t('common.appName')}
          </Text>
        </View>
        <UserMenu onChangePassword={() => setShowPasswordModal(true)} />
      </View>

      {/* Modal de troca de senha (acionado manualmente pelo UserMenu) */}
      <ChangePasswordModal
        visible={showPasswordModal}
        isTemporary={false}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
}
