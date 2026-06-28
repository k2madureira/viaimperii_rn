import React, { useEffect, useState } from 'react';
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
 * Popover ancorado a um gatilho. Abre **logo abaixo** do gatilho (colado ao ponto
 * de clique) e só vira para **cima** quando não há espaço suficiente abaixo na
 * tela. A altura real é medida no `onLayout` antes de decidir, então o popover
 * nunca fica distante do clique. Renderizado num Modal (sem clipping), fecha ao
 * tocar fora.
 */
export default function AnchoredPopover({
  anchor,
  onClose,
  width = 200,
  align = 'left',
  children,
}: Props) {
  const [contentH, setContentH] = useState(0);
  const anchorKey = anchor ? `${anchor.x},${anchor.y}` : null;

  // Reinicia a altura medida a cada nova abertura.
  useEffect(() => {
    setContentH(0);
  }, [anchorKey]);

  if (anchor == null) return null;

  const { width: SW, height: SH } = Dimensions.get('window');
  const gap = 6;

  const rawLeft = align === 'right' ? anchor.x + anchor.width - width : anchor.x;
  const left = Math.min(Math.max(8, rawLeft), SW - width - 8);

  // Posição preferida: abaixo do gatilho. Vira para cima só se estourar a tela.
  const belowTop = anchor.y + anchor.height + gap;
  const overflowsBelow = contentH > 0 && belowTop + contentH > SH - 8;
  const top = overflowsBelow ? Math.max(8, anchor.y - contentH - gap) : belowTop;

  // Só mostra depois de medir a altura (evita pulo ao decidir a direção).
  const ready = contentH > 0;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height);
          if (h && h !== contentH) setContentH(h);
        }}
        className="bg-white rounded-[14px] border border-[#eadfdf]"
        style={{
          position: 'absolute',
          left,
          top,
          width,
          opacity: ready ? 1 : 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.16,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        }}>
        {children}
      </View>
    </Modal>
  );
}
