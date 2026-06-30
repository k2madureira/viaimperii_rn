import React, { useRef, useState } from 'react';
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { KeyIcon, LogoutIcon, UserIcon } from '../../navigation/icons/MenuIcons';
import { useUserProfile } from '../../screens/dashboard/model/queries/useUserProfile';

interface Props {
  onChangePassword: () => void;
}

export default function UserMenu({ onChangePassword }: Props) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const profileQuery = useUserProfile(user?.user_id);
  const aa = profileQuery.data?.active_avatar;
  const avatarUrl = aa?.thumb_url ?? aa?.url ?? null;
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
        className="flex-row items-center"
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={t('userMenu.openMenu')}>
        <View className="w-10 h-10 rounded-full bg-[#f4eaea] items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 40, height: 40 }} resizeMode="cover" />
          ) : (
            <UserIcon size={22} />
          )}
        </View>
        {/* Indicador de que abre opções */}
        <View className="w-4 h-4 rounded-full bg-primary-500 items-center justify-center -ml-2 mt-5 border border-white">
          <Text className="text-[8px] text-white leading-none">▾</Text>
        </View>
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
                className="flex-row items-center gap-3 px-4 py-3"
                activeOpacity={0.7}
                onPress={() => { close(); onChangePassword(); }}>
                <KeyIcon size={18} color="#111" />
                <Text className="text-[14px] font-medium text-[#111]">{t('userMenu.changePassword')}</Text>
              </TouchableOpacity>

              <View className="h-px bg-[#f0f0f0]" />

              <TouchableOpacity
                className="flex-row items-center gap-3 px-4 py-3"
                activeOpacity={0.7}
                onPress={async () => { close(); await signOut(); }}>
                <LogoutIcon size={18} color="#ef4444" />
                <Text className="text-[14px] font-medium text-red-500">{t('userMenu.signOut')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
