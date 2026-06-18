import React, { useRef, useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { UserIcon } from '../../navigation/icons/MenuIcons';

interface Props {
  onChangePassword: () => void;
}

export default function UserMenu({ onChangePassword }: Props) {
  const { user, signOut } = useAuth();
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);

  const openMenu = () => {
    buttonRef.current?.measureInWindow((_x, y, _w, h) => {
      setAnchor({ top: y + h + 6, right: 16 });
      setVisible(true);
    });
  };

  const close = () => setVisible(false);

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        onPress={openMenu}
        className="w-10 h-10 rounded-full bg-[#f4eaea] items-center justify-center"
        activeOpacity={0.75}>
        <UserIcon size={22} />
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade" onRequestClose={close}>
        <TouchableWithoutFeedback onPress={close}>
          <View className="flex-1">
            <View
              className="absolute bg-white rounded-[12px] py-1 min-w-[200px]"
              style={{
                top: anchor.top,
                right: anchor.right,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 8,
              }}>
              {user && (
                <View className="px-4 py-3 border-b border-[#f0f0f0]">
                  <Text className="text-[13px] font-bold text-[#111]" numberOfLines={1}>{user.name}</Text>
                  <Text className="text-[11px] text-[#888]" numberOfLines={1}>{user.email}</Text>
                </View>
              )}

              <TouchableOpacity
                className="px-4 py-3"
                activeOpacity={0.7}
                onPress={() => { close(); onChangePassword(); }}>
                <Text className="text-[14px] font-medium text-[#111]">Alterar senha</Text>
              </TouchableOpacity>

              <View className="h-px bg-[#f0f0f0]" />

              <TouchableOpacity
                className="px-4 py-3"
                activeOpacity={0.7}
                onPress={async () => { close(); await signOut(); }}>
                <Text className="text-[14px] font-medium text-red-500">Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
