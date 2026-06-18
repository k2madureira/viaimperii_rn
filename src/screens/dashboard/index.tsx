import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { HomeNavigationProp } from '../../navigation/HomeStack';
import {
  AchievementsSection,
  ChangePasswordModal,
  MasterySection,
  MedalsSection,
  RankCard,
  RankingSection,
} from './components';
import { useRanking } from './model/queries/useRanking';
import { useUserProfile } from './model/queries/useUserProfile';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNavigationProp>();
  const { user } = useAuth();

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
      <Navbar />

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

      {/* Modal de troca de senha — abre automaticamente se senha for temporária */}
      <ChangePasswordModal visible={isTemporary} isTemporary={isTemporary} onClose={() => {}} />
    </View>
  );
}
