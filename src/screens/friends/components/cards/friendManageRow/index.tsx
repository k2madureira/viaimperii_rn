import React, { useRef, useState } from 'react';
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { FriendItem } from '../../../../../api/friendship';
import UserIdentity from '../userIdentity';

interface Props {
  item: FriendItem;
  onOpenProfile: (userId: string) => void;
  onUnfriend: (item: FriendItem) => void;
  onBlock: (item: FriendItem) => void;
}

// Linha da aba Amigos (gestão): identidade + menu "⋯" em dropdown flutuante
// (ver perfil / desfazer / bloquear). Segue o padrão de dropdown do UserMenu
// (Modal + measureInWindow) para não ser cortado pela FlatList.
export default function FriendManageRow({ item, onOpenProfile, onUnfriend, onBlock }: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);

  const open = () => {
    buttonRef.current?.measureInWindow((_x, y, _w, h) => {
      setAnchor({ top: y + h + 4, right: 20 });
      setVisible(true);
    });
  };
  const close = () => setVisible(false);
  const pick = (fn: () => void) => {
    close();
    fn();
  };

  return (
    <View className="bg-white rounded-[16px] border border-[#f0eded] px-4 py-3">
      <View className="flex-row items-center">
        <UserIdentity
          user={item.user}
          presenceStatus={item.presence_status}
          onPress={() => onOpenProfile(item.user.id)}
        />
        <TouchableOpacity
          ref={buttonRef}
          onPress={open}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={t('friends.actions.menu')}
          className="w-9 h-9 items-center justify-center">
          <Text className="text-[20px] text-[#888] leading-none">⋯</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={visible} animationType="fade" onRequestClose={close}>
        <TouchableWithoutFeedback onPress={close}>
          <View className="flex-1">
            <View
              className="absolute bg-white rounded-[12px] py-1 min-w-[180px]"
              style={{
                top: anchor.top,
                right: anchor.right,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 8,
              }}>
              <TouchableOpacity
                className="px-4 py-3"
                activeOpacity={0.7}
                onPress={() => pick(() => onOpenProfile(item.user.id))}>
                <Text className="text-[14px] text-[#111]">{t('friends.actions.viewProfile')}</Text>
              </TouchableOpacity>
              <View className="h-px bg-[#f0f0f0]" />
              <TouchableOpacity
                className="px-4 py-3"
                activeOpacity={0.7}
                onPress={() => pick(() => onUnfriend(item))}>
                <Text className="text-[14px] text-primary-500">
                  {t('friends.actions.unfriend')}
                </Text>
              </TouchableOpacity>
              <View className="h-px bg-[#f0f0f0]" />
              <TouchableOpacity
                className="px-4 py-3"
                activeOpacity={0.7}
                onPress={() => pick(() => onBlock(item))}>
                <Text className="text-[14px] text-red-500">{t('friends.actions.block')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
