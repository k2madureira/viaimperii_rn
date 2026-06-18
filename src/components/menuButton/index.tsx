import { useDrawerStatus } from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HamburgerIcon } from '../../navigation/icons/MenuIcons';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SIZE = 35;

/**
 * Botão global de menu — aba colada na borda esquerda, a 20% da altura da tela.
 * Abre o drawer e some enquanto ele está aberto (o "X" fica no sidebar).
 * Deve ser renderizado como filho direto da raiz da tela (que tem
 * paddingTop = insets.top), para o posicionamento absoluto ficar correto.
 */
export default function MenuButton() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isDrawerOpen = useDrawerStatus() === 'open';

  if (isDrawerOpen) return null;

  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      activeOpacity={0.85}
      style={{
        position: 'absolute',
        top: SCREEN_HEIGHT * 0.11 - insets.top,
        left: 0,
        width: SIZE,
        height: SIZE,
        borderTopRightRadius: SIZE / 2,
        borderBottomRightRadius: SIZE / 1,
        backgroundColor: '#8B1A2B',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
      }}>
      <HamburgerIcon size={17} color="#fff" />
    </TouchableOpacity>
  );
}
