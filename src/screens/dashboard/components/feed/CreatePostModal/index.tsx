import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import PostComposerForm from '../PostComposerForm';

interface Props {
  visible: boolean;
  canLegion?: boolean;
  canProvince?: boolean;
  authorAvatarUrl?: string | null;
  // Texto inicial (ex.: compartilhar missão concluída) — editável antes de publicar.
  initialText?: string;
  onClose: () => void;
}
 
// Modal de criação de post acessível pelo botão (+) da bottom tab bar — segue
// o padrão de modal do app (overlay escuro + card branco central, fecha ao
// tocar fora ou no X). Cresce com o conteúdo (texto, mídia, sugestões de
// menção, escopo) até um teto de 88% da altura, então rola por dentro.
export default function CreatePostModal({
  visible,
  canLegion,
  canProvince,
  authorAvatarUrl,
  initialText,
  onClose,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          {/* Fecha ao tocar fora — fica ATRÁS do card (absolute) para não
              interceptar/roubar o toque destinado ao editor. */}
          <Pressable className="absolute inset-0" onPress={onClose} />
          <View
            className="w-full bg-white rounded-[20px] p-6"
            style={{ maxHeight: '88%' }}>
            {/* Botão de fechar (a identidade + seletor de audiência do form fazem
                o papel de "nav" logo abaixo). */}
            <View className="flex-row items-center justify-end mb-2">
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="w-8 h-8 rounded-full bg-[#f0eded] items-center justify-center">
                <Text className="text-[16px] font-bold text-[#888]">×</Text>
              </TouchableOpacity>
            </View>

            {/* Sem ScrollView: na Nova Arquitetura (Fabric), montar/desmontar
                Views condicionais (ex.: grade de mídia) dentro de um ScrollView
                dispara um abort do Yoga (ScrollViewShadowNode::layout). O
                conteúdo cabe no card (maxHeight 88%). */}
            <View className="flex-shrink">
              <PostComposerForm
                canLegion={canLegion}
                canProvince={canProvince}
                large
                authorAvatarUrl={authorAvatarUrl}
                initialText={initialText}
                onPosted={onClose}
                onCancel={onClose}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
