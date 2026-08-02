import React from 'react';
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Text from '../text';
import { useTranslation } from 'react-i18next';
import { EditIcon } from '../icons';

interface CreateMenuOption {
  key: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreatePost: () => void;
}

// Menu de ação do botão (+) da tab bar. Hoje só "Criar post"; as demais opções
// (ex.: criar clã, criar evento) entram aqui conforme forem liberadas.
export default function CreateMenu({ visible, onClose, onCreatePost }: Props) {
  const { t } = useTranslation();

  const options: CreateMenuOption[] = [
    {
      key: 'post',
      label: t('createMenu.createPost'),
      icon: <EditIcon size={20} color="#9E1B32" />,
      onPress: () => {
        onClose();
        onCreatePost();
      },
    },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/40 justify-end">
          <TouchableWithoutFeedback>
            <View className="mx-4 mb-28 bg-white rounded-[20px] p-2">
              <Text className="text-[12px] font-semibold text-[#888] tracking-[2px] uppercase px-4 pt-3 pb-1">
                {t('createMenu.title')}
              </Text>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  className="flex-row items-center gap-3 px-4 py-3.5 rounded-[14px]"
                  activeOpacity={0.7}
                  onPress={opt.onPress}>
                  <View className="w-10 h-10 rounded-full bg-[#f4eaea] items-center justify-center">
                    {opt.icon}
                  </View>
                  <Text className="text-[15px] font-semibold text-[#111]">{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
