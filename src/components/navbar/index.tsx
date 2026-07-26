import React from 'react';
import { Platform, View } from 'react-native';
import Text from '../text';
import { useTranslation } from 'react-i18next';
import LogoIcon from '../logoIcon';
import UserMenu from '../userMenu';

interface Props {
  // Slot opcional à direita (antes do UserMenu) — usado pela Home/Perfil para
  // o botão de carteira, sem criar um header customizado.
  rightExtra?: React.ReactNode;
  // Variante do menu do usuário: 'default' (avatar + menu completo) em todas as
  // telas; 'gear' (engrenagem + menu reduzido) só no Dashboard.
  menuVariant?: 'default' | 'gear';
}

/**
 * Navbar usada nas telas internas (Missions, Ranking, etc.):
 * logo + nome do app à esquerda, UserMenu à direita.
 * A navegação principal agora é a bottom tab bar — sem botão de menu/drawer.
 */
export default function Navbar({ rightExtra, menuVariant = 'default' }: Props) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between px-4 pt-5 pb-3 bg-white border-b border-[#f0f0f0]">
      <View className="flex-row items-center">
        <LogoIcon size={22} color="#9E1B32" />
        <Text
          className="text-sm font-semibold text-[#111] tracking-[3px] ml-2"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {t('common.appName')}
        </Text>
      </View>
      <View className="flex-row items-center">
        {rightExtra ? <View style={{ marginRight: 16 }}>{rightExtra}</View> : null}
        <UserMenu variant={menuVariant} />
      </View>
    </View>
  );
}
