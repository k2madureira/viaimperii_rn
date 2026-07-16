import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONTENT_MAX_WIDTH } from '../../constants/layout';

interface Props {
  children: React.ReactNode;
  /** Classe do fundo da tela (padrão: o cinza das telas internas). */
  className?: string;
}

/**
 * Raiz padrão das telas internas. Faz duas coisas que toda tela repetia/precisa:
 *
 * 1. aplica o safe area do topo (`paddingTop: insets.top`) — obrigatório com o
 *    edge-to-edge do SDK 54 no Android, onde o conteúdo desenha sob a status bar;
 * 2. limita a coluna de conteúdo a `CONTENT_MAX_WIDTH` e a centraliza.
 *
 * O fundo fica na View **externa** (largura total) e o teto na **interna**, para
 * que em telas grandes as laterais continuem pintadas em vez de virar vão vazio.
 */
export default function ScreenContainer({ children, className = 'bg-[#fafafa]' }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className={`flex-1 ${className}`} style={{ paddingTop: insets.top }}>
      <View
        style={{ flex: 1, width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' }}>
        {children}
      </View>
    </View>
  );
}
