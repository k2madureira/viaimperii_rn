import React, { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { ChangePasswordModal } from '../../screens/dashboard/components';
import LogoIcon from '../logoIcon';
import MenuButton from '../menuButton';
import UserMenu from '../userMenu';

/**
 * Navbar global usada em todas as telas do dashboard:
 * logo + nome do app à esquerda, UserMenu à direita, botão de menu (drawer)
 * e o modal de troca de senha (acionado pelo UserMenu).
 */
export default function Navbar() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#f0f0f0]">
        <View className="flex-row items-center ml-8">
          <LogoIcon size={22} color="#8B1A2B" />
          <Text
            className="text-sm font-semibold text-[#111] tracking-[3px] ml-2"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            VIA IMPERII
          </Text>
        </View>
        <UserMenu onChangePassword={() => setShowPasswordModal(true)} />
      </View>

      {/* Botão de menu global, ancorado a 20% da altura da tela */}
      <MenuButton />

      {/* Modal de troca de senha (acionado manualmente pelo UserMenu) */}
      <ChangePasswordModal
        visible={showPasswordModal}
        isTemporary={false}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
}
