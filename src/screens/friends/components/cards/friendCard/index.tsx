import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
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

// Linha de um amigo: identidade + menu de ações (desfazer / bloquear).
export default function FriendCard({ item, onOpenProfile, onUnfriend, onBlock }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <View className="bg-white rounded-[16px] border border-[#f0eded] px-4 py-3">
      <View className="flex-row items-center">
        <UserIdentity
          user={item.user}
          isOnline={item.is_online}
          onPress={() => onOpenProfile(item.user.id)}
        />
        <TouchableOpacity
          onPress={() => setOpen((v) => !v)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={t('friends.actions.menu')}
          className="w-9 h-9 items-center justify-center">
          <Text className="text-[20px] text-[#888] leading-none">⋯</Text>
        </TouchableOpacity>
      </View>

      {open && (
        <View className="flex-row gap-2 mt-3 pt-3 border-t border-[#f5f0f0]">
          <TouchableOpacity
            onPress={() => {
              setOpen(false);
              onUnfriend(item);
            }}
            activeOpacity={0.8}
            className="flex-1 items-center py-2.5 rounded-[12px] bg-[#f4eaea]">
            <Text className="text-[13px] font-bold text-primary-500">
              {t('friends.actions.unfriend')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setOpen(false);
              onBlock(item);
            }}
            activeOpacity={0.8}
            className="flex-1 items-center py-2.5 rounded-[12px] bg-[#fbeaea]">
            <Text className="text-[13px] font-bold text-red-500">
              {t('friends.actions.block')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
