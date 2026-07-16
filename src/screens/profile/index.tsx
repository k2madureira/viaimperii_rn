import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { parseBackendDate } from '../../utils/date';
import { ChangePasswordModal } from '../dashboard/components';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useWallet } from '../dashboard/model/queries/useWallet';
import { useUserStats } from '../missions/model/queries/useUserStats';
import { AvatarPickerModal, AvatarViewerModal, ErrorState, XpProgress } from './components';
import {
  MasterySection,
  PrivateSection,
  ProfileCards,
  ProfileIdentity,
  ProfileStats,
  ProfileTopBar,
} from './components/sections';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const route = useRoute<RouteProp<HomeStackParamList, 'Profile'>>();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Perfil próprio quando não vem userId no params (ou é o id do logado).
  const routeUserId = route.params?.userId;
  const targetId = routeUserId ?? user?.user_id;
  const isOwnProfile = !routeUserId || routeUserId === user?.user_id;

  const profileQuery = useUserProfile(targetId);
  // Counts agregados (all-time) — visíveis em qualquer perfil.
  const statsQuery = useUserStats(targetId, 'all');
  // Carteira — só no próprio perfil (saldo do usuário logado).
  const walletQuery = useWallet(isOwnProfile);

  const data = profileQuery.data;
  const stats = statsQuery.data;

  const name = data?.user.name ?? (isOwnProfile ? user?.name : undefined) ?? '—';
  const avatarFull = data?.active_avatar?.url ?? null;
  // Ícone do cabeçalho usa a thumb leve; a ampliação usa a imagem cheia.
  const avatarUrl = data?.active_avatar?.thumb_url ?? avatarFull;
  const cr = data?.current_rank;
  const rankName = cr?.name ?? data?.user.rank ?? '—';
  const totalXp = cr?.total_xp ?? data?.user.total_xp ?? 0;
  const mastery = data?.user.mastery ?? {};

  const memberSince = React.useMemo(() => {
    const d = parseBackendDate(data?.user.created_at);
    if (!d) return '—';
    return d.toLocaleDateString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
      month: 'short',
      year: 'numeric',
    });
  }, [data?.user.created_at, i18n.language]);

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <ProfileTopBar isOwnProfile={isOwnProfile} balance={walletQuery.data?.balance} />

      {profileQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#9E1B32" />
        </View>
      ) : profileQuery.isError ? (
        <ErrorState onRetry={() => profileQuery.refetch()} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={profileQuery.isFetching || statsQuery.isFetching}
              onRefresh={() => {
                profileQuery.refetch();
                statsQuery.refetch();
              }}
              tintColor="#9E1B32"
            />
          }>
          <ProfileIdentity
            name={name}
            avatarUrl={avatarUrl}
            rankName={rankName}
            rankImage={cr?.image_url ?? null}
            memberSince={memberSince}
            isOwnProfile={isOwnProfile}
            onOpenAvatar={() => avatarUrl && setShowAvatar(true)}
            onEditAvatar={() => setShowAvatarPicker(true)}
          />

          {/* Destaque de XP total */}
          <XpProgress totalXp={totalXp} />

          <ProfileCards data={data} rankName={rankName} totalXp={totalXp} />

          <ProfileStats data={data} stats={stats} loading={statsQuery.isLoading} />

          <MasterySection mastery={mastery} />

          {isOwnProfile && <PrivateSection onChangePassword={() => setShowPassword(true)} />}
        </ScrollView>
      )}

      {isOwnProfile && (
        <ChangePasswordModal
          visible={showPassword}
          isTemporary={false}
          onClose={() => setShowPassword(false)}
        />
      )}

      {isOwnProfile && (
        <AvatarPickerModal visible={showAvatarPicker} onClose={() => setShowAvatarPicker(false)} />
      )}

      <AvatarViewerModal
        visible={showAvatar}
        avatarUrl={avatarFull}
        name={name}
        onClose={() => setShowAvatar(false)}
      />
    </View>
  );
}
