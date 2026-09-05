import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Text from '../text';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { LogoutIcon, UserIcon } from '../../navigation/icons/MenuIcons';
import { GearIcon, ChestIcon } from '../icons';
import { useUserProfile } from '../../screens/dashboard/model/queries/useUserProfile';
import { viaimperiiApi } from '../../api';
import { SettableStatus, SETTABLE_STATUSES } from '../../api/presence';

// Cor do ponto por status próprio (§Amigos presence).
const STATUS_COLOR: Record<SettableStatus, string> = {
  available: '#2F7A52', // verde — disponível
  busy: '#9E1B32', // vermelho — ocupado
  away: '#D4AF37', // âmbar — ausente
  invisible: '#9aa0a6', // cinza — ninguém vê você online
};

interface Props {
  // 'default' = gatilho avatar + menu completo (info + Meu perfil + Sair) — usado em
  // TODAS as telas. 'gear' = gatilho engrenagem + menu reduzido (info + Sair) —
  // exclusivo do Dashboard.
  variant?: 'default' | 'gear';
}

export default function UserMenu({ variant = 'default' }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, signOut } = useAuth();
  const profileQuery = useUserProfile(user?.user_id);
  const aa = profileQuery.data?.active_avatar;
  const avatarUrl = aa?.thumb_url ?? aa?.url ?? null;
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<React.ComponentRef<typeof TouchableOpacity>>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const queryClient = useQueryClient();
  const presenceQuery = useQuery({
    queryKey: ['my-presence'],
    queryFn: viaimperiiApi.presence.get,
    enabled: !!user,
  });
  const setPresenceM = useMutation({
    mutationFn: (status: SettableStatus) => viaimperiiApi.presence.set(status),
    onSuccess: (data) => queryClient.setQueryData(['my-presence'], data),
  });
  const currentStatus: SettableStatus = presenceQuery.data?.status ?? 'available';

  const isGear = variant === 'gear';

  const openMenu = () => {
    buttonRef.current?.measureInWindow((_x, y, _w, h) => {
      setAnchor({ top: y + h + 6, right: 16 });
      setVisible(true);
    });
  };

  const close = () => {
    setVisible(false);
    setStatusOpen(false);
  };

  // Perfil vive no HomeStack (aba Home). `navigate('Home', { screen: 'Profile' })`
  // funciona de qualquer aba: a ação sobe até o tab navigator que conhece 'Home'.
  const goToProfile = () => {
    close();
    navigation.navigate('Home', { screen: 'Profile', params: {} });
  };

  const goToChests = () => {
    close();
    navigation.navigate('Home', { screen: 'Chests' });
  };

  return (
    <>
      {isGear ? (
        <TouchableOpacity
          ref={buttonRef}
          onPress={openMenu}
          className="w-9 h-9 items-center justify-center"
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={t('userMenu.openMenu')}>
          <GearIcon size={22} color="#111" />
        </TouchableOpacity>
      ) : (
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
      )}

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
                <TouchableOpacity
                  className="px-4 py-3"
                  activeOpacity={0.7}
                  onPress={goToProfile}>
                  <Text className="text-[13px] font-bold text-[#111]" numberOfLines={1}>{user.name}</Text>
                  <Text className="text-[11px] text-[#888]" numberOfLines={1}>{user.email}</Text>
                </TouchableOpacity>
              )}

              {/* Status próprio: mostra o atual; tocar abre a seleção (§Amigos presence). */}
              {user && (
                <View className="border-b border-t border-[#f0f0f0]">
                  <TouchableOpacity
                    className="flex-row items-center gap-2 px-4 py-2.5"
                    activeOpacity={0.7}
                    onPress={() => setStatusOpen((v) => !v)}>
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLOR[currentStatus] }}
                    />
                    <Text className="text-[13px] text-[#111] flex-1">
                      {t(`presence.${currentStatus}`)}
                    </Text>
                    {setPresenceM.isPending ? (
                      <ActivityIndicator size="small" color="#9E1B32" />
                    ) : (
                      <Text className="text-[10px] text-[#888] leading-none">
                        {statusOpen ? '▴' : '▾'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {statusOpen && (
                    <View className="pb-1">
                      {SETTABLE_STATUSES.map((s) => (
                        <TouchableOpacity
                          key={s}
                          className="flex-row items-center gap-2 px-4 py-2 pl-6"
                          activeOpacity={0.7}
                          onPress={() => {
                            if (s !== currentStatus) setPresenceM.mutate(s);
                            setStatusOpen(false);
                          }}>
                          <View
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: STATUS_COLOR[s] }}
                          />
                          <Text
                            className={`text-[13px] ${
                              s === currentStatus ? 'font-bold text-[#111]' : 'text-[#555]'
                            }`}>
                            {t(`presence.${s}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* "Meu perfil" só no menu completo; o gear reduz para info + Sair. */}
              {!isGear && (
                <>
                  <TouchableOpacity
                    className="flex-row items-center gap-3 px-4 py-3"
                    activeOpacity={0.7}
                    onPress={goToProfile}>
                    <UserIcon size={18} color="#111" />
                    <Text className="text-[14px] font-medium text-[#111]">{t('userMenu.profile')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center gap-3 px-4 py-3"
                    activeOpacity={0.7}
                    onPress={goToChests}>
                    <ChestIcon size={18} color="#8B1A2B" />
                    <Text className="text-[14px] font-medium text-[#111]">{t('chests.title')}</Text>
                  </TouchableOpacity>

                  <View className="h-px bg-[#f0f0f0]" />
                </>
              )}

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
