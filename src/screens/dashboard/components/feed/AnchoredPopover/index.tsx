import React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';

export interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  anchor: Anchor | null; // coordenadas (window) do gatilho; null = fechado
  onClose: () => void;
  width?: number;
  align?: 'left' | 'right';
  children: React.ReactNode;
}

/**
 * Popover ancorado a um gatilho. Abre para BAIXO (dropdown) ou para CIMA (dropup)
 * conforme a posição do gatilho na tela — se está na metade de baixo, abre para
 * cima. Renderizado num Modal (sem clipping), fecha ao tocar fora.
 */
export default function AnchoredPopover({
  anchor,
  onClose,
  width = 200,
  align = 'left',
  children,
}: Props) {
  if (anchor == null) return null;

  const { width: SW, height: SH } = Dimensions.get('window');
  const gap = 6;
  const openUp = anchor.y > SH / 2;

  const rawLeft = align === 'right' ? anchor.x + anchor.width - width : anchor.x;
  const left = Math.min(Math.max(8, rawLeft), SW - width - 8);

  const vertical = openUp
    ? { bottom: SH - anchor.y + gap }
    : { top: anchor.y + anchor.height + gap };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View
        className="bg-white rounded-[14px] border border-[#eadfdf]"
        style={[
          {
            position: 'absolute',
            left,
            width,
            elevation: 10,
            shadowColor: '#000',
            shadowOpacity: 0.16,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
          },
          vertical,
        ]}>
        {children}
      </View>
    </Modal>
  );
}
