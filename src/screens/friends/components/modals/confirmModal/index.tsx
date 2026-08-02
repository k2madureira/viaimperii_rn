import React from 'react';
import { ActivityIndicator, Modal, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// Confirmação no padrão de overlay do app (card central + bg-black/60), nunca
// Alert nativo — mesma linguagem visual do LegionSelectModal.
export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  destructive = false,
  pending = false,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full bg-white rounded-[20px] p-6">
          <Text className="text-[16px] font-extrabold text-charcoal text-center">{title}</Text>
          <Text className="text-[13px] text-[#888] text-center mt-2 leading-[19px]">{message}</Text>

          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              onPress={onClose}
              disabled={pending}
              activeOpacity={0.85}
              className="flex-1 items-center py-3 rounded-[12px] bg-[#f2eded]">
              <Text className="text-[14px] font-bold text-[#666]">{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={pending}
              activeOpacity={0.85}
              className={`flex-1 items-center py-3 rounded-[12px] ${
                destructive ? 'bg-red-500' : 'bg-primary-500'
              } ${pending ? 'opacity-70' : ''}`}>
              {pending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-[14px] font-bold text-white">{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
