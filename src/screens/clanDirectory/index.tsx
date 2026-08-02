import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/screenContainer';
import Navbar from '../../components/navbar';
import SearchBar from '../../components/searchBar';
import Text from '../../components/text';
import { PlusIcon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useClans } from './model/queries/useClans';
import { ClanRow, CreateClanModal } from './components';

// Diretório de clãs — busca (nome/tag) e navegação para o detalhe do clã. Como a
// entrada em clã é por CONVITE (capitão+), aqui o usuário descobre clãs e abre o
// detalhe; a solicitação/convite é tratada no fluxo do backend (ver nota abaixo).
export default function ClanDirectoryScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [createVisible, setCreateVisible] = useState(false);

  const clansQuery = useClans(q);
  const items = clansQuery.data?.items ?? [];

  // Nível de patente do usuário — decide se o modal de criação mostra o formulário
  // ou só os requisitos de fundação.
  const profileQuery = useUserProfile(user?.user_id);
  const rankLevel = profileQuery.data?.current_rank?.level ?? 0;

  return (
    <ScreenContainer>
      <Navbar />

      <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#f0f0f0]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-8 h-8 items-center justify-center -ml-1"
          activeOpacity={0.7}>
          <Text className="text-[24px] text-[#111] leading-none">‹</Text>
        </TouchableOpacity>
        <Text className="text-[16px] font-bold text-[#111] ml-1 flex-1">
          {t('clan.directory.title')}
        </Text>
        <TouchableOpacity
          onPress={() => setCreateVisible(true)}
          className="flex-row items-center bg-primary-700 rounded-full pl-2.5 pr-3.5 py-1.5"
          activeOpacity={0.85}>
          <PlusIcon size={16} color="#fff" strokeWidth={2.6} />
          <Text className="text-[13px] font-bold text-white ml-1">{t('clan.create.action')}</Text>
        </TouchableOpacity>
      </View>

      <View className="px-5 pt-4 pb-2">
        <SearchBar value={q} onChangeText={setQ} placeholder={t('clan.directory.searchPlaceholder')} />
      </View>

      {clansQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#9E1B32" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: insets.bottom + 24,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ClanRow
              clan={item}
              onPress={() => navigation.navigate('Clan', { clanId: item.id })}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-16 px-8">
              <Text className="text-[15px] text-[#888] text-center">
                {q.trim() ? t('clan.directory.emptySearch') : t('clan.directory.empty')}
              </Text>
            </View>
          }
        />
      )}

      <CreateClanModal
        visible={createVisible}
        rankLevel={rankLevel}
        onClose={() => setCreateVisible(false)}
        onCreated={(clanId) => navigation.navigate('Clan', { clanId })}
      />
    </ScreenContainer>
  );
}
