import React from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PostComposerForm from '../PostComposerForm';

interface Props {
  visible: boolean;
  canLegion?: boolean;
  canProvince?: boolean;
  onClose: () => void;
}

// Modal de criação de post acessível pelo botão (+) da bottom tab bar — segue
// o padrão de modal do app (overlay escuro + card branco central, fecha ao
// tocar fora ou no X). Altura fixa de 50% da tela — específica deste modal,
// não deve ser copiada para os demais (que usam maxHeight).
export default function CreatePostModal({ visible, canLegion, canProvince, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 items-center justify-center px-6" onPress={onClose}>
        <Pressable
          onPress={() => {}}
          className="w-full bg-white rounded-[20px] p-6"
          style={{ height: '50%' }}>
          {/* Cabeçalho equilibrado: espaço fantasma à esquerda do mesmo tamanho
              do botão X, para o título ficar realmente centralizado. */}
          <View className="flex-row items-center justify-between mb-4">
            <View style={{ width: 32 }} />
            <Text className="flex-1 text-[16px] font-extrabold text-charcoal text-center">
              {t('feed.createPostTitle')}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="w-8 h-8 rounded-full bg-[#f0eded] items-center justify-center">
              <Text className="text-[16px] font-bold text-[#888]">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <PostComposerForm
              canLegion={canLegion}
              canProvince={canProvince}
              fillHeight
              onPosted={onClose}
              onCancel={onClose}
            />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
