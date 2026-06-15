import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogoIcon from '../../components/LogoIcon';
import MenuButton from '../../components/MenuButton';
import { useAuth } from '../../contexts/AuthContext';
import { HomeNavigationProp } from '../../navigation/HomeStack';
import AchievementsSection from './components/AchievementsSection';
import ChangePasswordModal from './components/ChangePasswordModal';
import MasterySection from './components/MasterySection';
import MedalsSection from './components/MedalsSection';
import RankCard from './components/RankCard';
import RankingSection from './components/RankingSection';
import UserMenu from './components/UserMenu';
import { useRanking } from './model/queries/useRanking';
import { useUserProfile } from './model/queries/useUserProfile';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNavigationProp>();
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const isTemporary = user?.is_temporary_password === true;

  const profileQuery = useUserProfile(user?.user_id);
  const rankingQuery = useRanking();

  const profile = profileQuery.data?.user;
  const xpToNextRank = profileQuery.data?.xp_to_next_rank ?? 0;
  const currentRank = profileQuery.data?.current_rank ?? null;
  const achievements = profileQuery.data?.achievements ?? [];
  const refreshing = profileQuery.isRefetching || rankingQuery.isRefetching;

  const onRefresh = () => {
    profileQuery.refetch();
    rankingQuery.refetch();
  };

  // Fallback para os dados do login enquanto o perfil carrega
  const rank = profile?.rank ?? user?.rank ?? '—';
  const totalXp = profile?.total_xp ?? user?.total_xp ?? 0;
  const mastery = profile?.mastery ?? user?.mastery ?? {};
  const mainSpecialty = profile?.main_specialty ?? user?.main_specialty ?? null;
  const medals = profile?.medals ?? [];

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#f0f0f0]">
        <View className="flex-row items-center ml-10">
          <LogoIcon size={22} color="#8B1A2B" />
          <Text
            className="text-sm font-semibold text-[#111] tracking-[3px] ml-2"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            VIA IMPERII
          </Text>
        </View>
        <UserMenu onChangePassword={() => setShowPasswordModal(true)} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 22 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B1A2B" />
        }>
        {/* Saudação */}
        <View>
          <Text
            className="text-[22px] font-extrabold text-[#111]"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            Ave, {user?.name?.split(' ')[0]}!
          </Text>
          <Text className="text-[13px] text-[#888] mt-0.5">Bem-vindo ao Império.</Text>
        </View>

        <RankCard
          rank={rank}
          totalXp={totalXp}
          xpToNextRank={xpToNextRank}
          imageUrl={currentRank?.image_url}
          onPress={() => navigation.navigate('Ranks')}
        />

        <MasterySection
          mastery={mastery}
          mainSpecialty={mainSpecialty}
          rankLevel={currentRank?.level ?? 1}
        />

        {achievements.length > 0 && <AchievementsSection achievements={achievements} />}

        <MedalsSection medals={medals} />

        <RankingSection
          ranking={rankingQuery.data?.ranking}
          isLoading={rankingQuery.isLoading}
          currentUserName={user?.name}
        />
      </ScrollView>

      {/* Botão de menu global, ancorado a 20% da altura da tela */}
      <MenuButton />

      {/* Modal de troca de senha — abre automaticamente se senha for temporária */}
      <ChangePasswordModal
        visible={showPasswordModal || isTemporary}
        isTemporary={isTemporary}
        onClose={() => setShowPasswordModal(false)}
      />
    </View>
  );
}
