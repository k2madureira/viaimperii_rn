import React from 'react';
import { Image, Modal, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';

interface Props {
  visible: boolean;
  avatarUrl: string | null;
  name: string;
  onClose: () => void;
}

// Avatar ampliado (toque em qualquer lugar fecha).
export default function AvatarViewerModal({ visible, avatarUrl, name, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/80 items-center justify-center">
        <View className="w-64 h-64 rounded-full overflow-hidden border-4 border-white/20">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 256, height: 256 }} resizeMode="cover" />
          ) : null}
        </View>
        <Text className="text-white/60 text-[13px] mt-4">{name}</Text>
      </TouchableOpacity>
    </Modal>
  );
}
