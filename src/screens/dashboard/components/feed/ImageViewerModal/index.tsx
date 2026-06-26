import React from 'react';
import { Image, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  uri: string | null;
  onClose: () => void;
}

// Visualizador de imagem em tela cheia (toque em qualquer lugar fecha).
export default function ImageViewerModal({ uri, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      visible={uri != null}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' }}>
        {uri ? (
          <Image source={{ uri }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
        ) : null}
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          style={{ position: 'absolute', top: insets.top + 8, right: 16 }}
          className="w-10 h-10 rounded-full bg-white/15 items-center justify-center">
          <Text className="text-[20px] text-white">✕</Text>
        </TouchableOpacity>
      </Pressable>
    </Modal>
  );
}
