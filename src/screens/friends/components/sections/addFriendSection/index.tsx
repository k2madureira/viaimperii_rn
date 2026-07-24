import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import TextInput from '../../../../../components/textInput';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../../api';
import { FeedAuthor } from '../../../../../api/feed';
import { SearchIcon } from '../../../../../components/icons';
import { useSendFriendRequest } from '../../../model/mutations/useSendFriendRequest';
import UserResultRow from '../../cards/userResultRow';

interface Props {
  currentUserId?: string;
}

// Handle normalizado (sem @, minúsculas) — o backend valida o formato completo.
function cleanHandle(raw: string): string {
  return raw.trim().replace(/^@+/, '').toLowerCase();
}

// Busca de usuário + envio de pedido de amizade (por @handle no submit ou por
// user_id ao tocar num resultado do autocomplete). Query e mutation vivem aqui.
export default function AddFriendSection({ currentUserId }: Props) {
  const { t } = useTranslation();
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const sendM = useSendFriendRequest();

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(id);
  }, [term]);

  const searchQuery = useQuery({
    queryKey: ['user-search', debounced],
    queryFn: () => viaimperiiApi.feed.searchUsers(debounced, 8),
    enabled: debounced.length >= 2,
  });

  const results = (searchQuery.data ?? []).filter((u) => u.id !== currentUserId);
  const handle = cleanHandle(term);

  const send = (input: { handle?: string; user_id?: string }, key: string) => {
    if (sendM.isPending) return;
    setPendingKey(key);
    sendM.mutate(input, {
      onSettled: () => setPendingKey(null),
      onSuccess: () => {
        setTerm('');
        setDebounced('');
      },
    });
  };

  const addByUser = (user: FeedAuthor) => send({ user_id: user.id }, user.id);
  const addByHandle = () => {
    if (handle.length < 3) return;
    send({ handle }, 'handle');
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center bg-white border border-[#f0eded] rounded-[16px] px-4" style={{ height: 50 }}>
        <SearchIcon size={20} color="#9aa0a6" />
        <TextInput
          value={term}
          onChangeText={setTerm}
          placeholder={t('friends.add.placeholder')}
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={addByHandle}
          returnKeyType="send"
          className="flex-1 ml-3 text-[15px] text-charcoal"
        />
        {searchQuery.isFetching && <ActivityIndicator size="small" color="#8B1A2B" />}
      </View>

      {/* Resultados do autocomplete */}
      {debounced.length >= 2 && (
        <View className="bg-white border border-[#f0eded] rounded-[16px] px-3 py-1">
          {results.length > 0 ? (
            results.map((u) => (
              <UserResultRow
                key={u.id}
                user={u}
                pending={pendingKey === u.id}
                onAdd={addByUser}
              />
            ))
          ) : searchQuery.isFetching ? (
            <Text className="text-[13px] text-[#999] py-3 px-1">{t('common.loading')}</Text>
          ) : (
            <TouchableOpacity
              onPress={addByHandle}
              disabled={handle.length < 3 || pendingKey === 'handle'}
              activeOpacity={0.8}
              className="flex-row items-center justify-between py-3 px-1">
              <Text className="text-[13px] text-charcoal flex-1" numberOfLines={1}>
                {handle.length >= 3
                  ? t('friends.add.sendToHandle', { handle })
                  : t('friends.add.noResults')}
              </Text>
              {pendingKey === 'handle' && <ActivityIndicator size="small" color="#8B1A2B" />}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
