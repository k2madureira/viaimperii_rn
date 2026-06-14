import { useDrawerStatus } from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogoIcon from '../../components/LogoIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { HomeNavigationProp } from '../../navigation/HomeStack';
import { HamburgerIcon } from '../../navigation/icons/MenuIcons';

const TOGGLE_SIZE = 32;
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
  const { anchorY, buttonX, setGeom } = useSidebar();
  const isDrawerOpen = useDrawerStatus() === 'open';
  const greetingRef = useRef<View>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const measureGreeting = () => {
    greetingRef.current?.measureInWindow((_x, y, w, h) => {
      if (w > 0) {
        // Botão colado na borda esquerda da tela, no nível do título.
        setGeom({ anchorY: y + h + 4, buttonX: TOGGLE_SIZE / 2 });
      }
    });
  };

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
        <View className="flex-row items-center">
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
        {/* Saudação — deslocada à direita para o botão colado na borda não sobrepor */}
        <View className="ml-[44px]">
          <View ref={greetingRef} onLayout={measureGreeting} className="self-start">
            <Text
              className="text-[22px] font-extrabold text-[#111]"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              Ave, {user?.name?.split(' ')[0]}!
            </Text>
          </View>
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

      {/* Botão de menu colado na borda esquerda, no nível do título "Ave, user!".
          Some quando o menu abre (o "X" passa a ser o do sidebar). */}
      {!isDrawerOpen && (
        <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            activeOpacity={0.85}
            style={{
              position: 'absolute',
              // topo do botão alinhado ao topo do sidebar (window y = anchorY)
              top: anchorY - insets.top,
              left: buttonX - TOGGLE_SIZE / 2,
              width: TOGGLE_SIZE,
              height: TOGGLE_SIZE,
              borderTopRightRadius: TOGGLE_SIZE / 2,
              borderBottomRightRadius: TOGGLE_SIZE / 2,
              backgroundColor: '#8B1A2B',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <HamburgerIcon size={17} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de troca de senha — abre automaticamente se senha for temporária */}
      <ChangePasswordModal
        visible={showPasswordModal || isTemporary}
        isTemporary={isTemporary}
        onClose={() => setShowPasswordModal(false)}
      />
    </View>
  );
}
