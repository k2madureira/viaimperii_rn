import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { FeedAuthor } from '../../../../../api/feed';
import UserIdentity from '../userIdentity';

interface Props {
  user: FeedAuthor;
  onAdd: (user: FeedAuthor) => void;
  pending?: boolean;
}

// Resultado da busca por usuário: identidade + botão de adicionar amigo.
export default function UserResultRow({ user, onAdd, pending }: Props) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center px-1 py-2.5 border-b border-[#f5f0f0]">
      <UserIdentity user={user} />
      <TouchableOpacity
        onPress={() => onAdd(user)}
        disabled={pending}
        activeOpacity={0.85}
        className={`px-3.5 py-2 rounded-[12px] bg-primary-500 ${pending ? 'opacity-60' : ''}`}>
        {pending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-[12px] font-bold text-white">{t('friends.actions.add')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
