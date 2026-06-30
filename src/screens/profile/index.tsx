import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SvgUri } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { KeyIcon, LogoutIcon } from '../../navigation/icons/MenuIcons';
import { useAuth } from '../../contexts/AuthContext';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { parseBackendDate } from '../../utils/date';
import {
  CommerceIcon,
  DiplomacyIcon,
  EngineeringIcon,
  ExplorationIcon,
  StrategyIcon,
} from '../../components/masteryIcons';
import { legionColorById } from '../../utils/legionColors';
import { ChangePasswordModal, LegionCard, RankCard } from '../dashboard/components';
import AvatarPickerModal from './components/avatarPickerModal';
import { UserCountry } from '../../api/users/userApi';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useLegions } from '../missions/model/queries/useLegions';
import { useUserStats } from '../missions/model/queries/useUserStats';

const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const MASTERY_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  engineering: EngineeringIcon,
  strategy: StrategyIcon,
  commerce: CommerceIcon,
  diplomacy: DiplomacyIcon,
  exploration: ExplorationIcon,
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const route = useRoute<RouteProp<HomeStackParamList, 'Profile'>>();
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
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
  // Legiões — usadas só para derivar a cor canônica da legião (igual à home).
  const legionsQuery = useLegions();

  const data = profileQuery.data;
  const stats = statsQuery.data;

  const name = data?.user.name ?? (isOwnProfile ? user?.name : undefined) ?? '—';
  const initial = name.trim().charAt(0).toUpperCase();
  const avatarFull = data?.active_avatar?.url ?? null;
  // Ícone do cabeçalho usa a thumb leve; a ampliação usa a imagem cheia.
  const avatarUrl = data?.active_avatar?.thumb_url ?? avatarFull;
  const cr = data?.current_rank;
  const rankName = cr?.name ?? data?.user.rank ?? '—';
  const rankImage = cr?.image_url ?? null;
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

  const loading = profileQuery.isLoading;
  const failed = profileQuery.isError;

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      {/* Navbar com seta de voltar quando visualizando perfil de outro usuário */}
      {isOwnProfile ? (
        <Navbar />
      ) : (
        <View className="flex-row items-center px-4 pt-5 pb-3 bg-white border-b border-[#f0f0f0]">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="pr-3"
            accessibilityLabel={t('common.back')}>
            <Text className="text-[24px] text-[#333] leading-none">‹</Text>
          </TouchableOpacity>
          <Text
            className="text-sm font-semibold text-[#111] tracking-[3px]"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {t('nav.profile')}
          </Text>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#9E1B32" />
        </View>
      ) : failed ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[14px] text-[#888] text-center mb-4">
            {t('profile.loadError')}
          </Text>
          <TouchableOpacity
            onPress={() => profileQuery.refetch()}
            className="bg-primary-500 rounded-[12px] px-5 py-2.5">
            <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={profileQuery.isFetching || statsQuery.isFetching}
              onRefresh={() => { profileQuery.refetch(); statsQuery.refetch(); }}
              tintColor="#9E1B32"
            />
          }>
          {/* Cabeçalho do perfil */}
          <View className="items-center pt-2">
            <View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => avatarUrl && setShowAvatar(true)}
                className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={{ width: 80, height: 80 }} resizeMode="cover" />
                ) : (
                  <Text className="text-[30px] font-extrabold text-white">{initial}</Text>
                )}
              </TouchableOpacity>
              {/* Editar avatar — abre o seletor (possuídos + loja) */}
              {isOwnProfile && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowAvatarPicker(true)}
                  accessibilityLabel={t('avatarPicker.editAvatar')}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-charcoal border-2 border-white items-center justify-center">
                  <Text className="text-[11px]">✏️</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text
              className="text-[22px] font-extrabold text-charcoal mt-3"
              style={{ fontFamily: serif }}>
              {name}
            </Text>
            {/* Chip de patente */}
            <View className="flex-row items-center mt-1.5">
              {rankImage ? (
                <Image
                  source={{ uri: rankImage }}
                  style={{ width: 18, height: 18, marginRight: 5 }}
                  resizeMode="contain"
                />
              ) : null}
              <Text className="text-[13px] font-semibold text-[#777]">{rankName}</Text>
            </View>
            <Text className="text-[12px] text-[#aaa] mt-1">
              {t('profile.memberSince')} {memberSince}
            </Text>
          </View>

          {/* Destaque de XP total */}
          <XpProgress totalXp={totalXp} />

          {/* Cards: patente (componente da home) · legião (brasão) · origem */}
          <View className="gap-3">
            <RankCard
              rank={rankName}
              totalXp={totalXp}
              xpToNextRank={cr?.xp_to_next_rank ?? 0}
              progressPct={cr?.progress_pct}
              imageUrl={cr?.image_url}
              trackName={data?.track?.name}
              onPress={() => (navigation as any).navigate('Home', { screen: 'Ranks' })}
            />
            <LegionCard
              legion={data?.legion ?? null}
              color={legionColorById(legionsQuery.data, data?.legion?.id)}
            />
            <LocalCard
              country={data?.province?.country ?? null}
              province={data?.province?.name ?? null}
              track={data?.track?.name ?? null}
            />
          </View>

          {/* Grid de counts */}
          <View>
            <SectionLabel text={t('profile.statsTitle')} />
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              <StatCard
                value={stats?.missions_completed_total ?? data?.user.completed_missions?.length ?? 0}
                label={t('profile.stats.missionsCompleted')}
                loading={statsQuery.isLoading}
              />
              <StatCard
                value={stats?.achievements_unlocked ?? data?.achievements?.length ?? 0}
                label={t('profile.stats.achievements')}
                loading={statsQuery.isLoading}
              />
              <StatCard
                value={stats?.medals_count ?? data?.user.medals?.length ?? 0}
                label={t('profile.stats.medals')}
                loading={statsQuery.isLoading}
              />
              <StatCard
                value={stats?.campaigns_completed ?? data?.user.completed_campaigns?.length ?? 0}
                label={t('profile.stats.campaigns')}
                loading={statsQuery.isLoading}
              />
              <StatCard
                value={stats?.ranks_gained ?? 0}
                label={t('profile.stats.ranksGained')}
                loading={statsQuery.isLoading}
              />
              <StatCard
                value={stats?.active_days ?? 0}
                label={t('profile.stats.activeDays')}
                loading={statsQuery.isLoading}
              />
            </View>
          </View>

          {/* Maestria por especialidade */}
          {Object.keys(mastery).length > 0 && (
            <View>
              <SectionLabel text={t('profile.masteryTitle')} />
              <View className="bg-white border border-[#f0eded] rounded-[16px] p-4" style={{ gap: 14 }}>
                {Object.entries(mastery).map(([key, val]) => (
                  <MasteryRow key={key} name={key} value={val} />
                ))}
              </View>
            </View>
          )}

          {/* Seção privada — somente no próprio perfil */}
          {isOwnProfile && (
            <View>
              <SectionLabel text={t('profile.privateSection')} />
              <View className="bg-white border border-[#f0eded] rounded-[16px] overflow-hidden mb-3">
                <InfoRow label="E-mail" value={user?.email ?? '—'} last />
              </View>

              <TouchableOpacity
                onPress={() => setShowPassword(true)}
                activeOpacity={0.85}
                className="flex-row items-center justify-center gap-2 bg-white border border-[#f0eded] rounded-[14px] py-3.5 mb-3">
                <KeyIcon size={18} color="#1f1f1f" />
                <Text className="text-[14px] font-bold text-charcoal">{t('profile.changePassword')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => signOut()}
                activeOpacity={0.85}
                className="flex-row items-center justify-center gap-2 bg-primary-500 rounded-[14px] py-3.5">
                <LogoutIcon size={18} color="#ffffff" />
                <Text className="text-[14px] font-bold text-white">{t('profile.signOut')}</Text>
              </TouchableOpacity>
            </View>
          )}
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
        <AvatarPickerModal
          visible={showAvatarPicker}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}

      {/* Avatar ampliado */}
      <Modal visible={showAvatar} transparent animationType="fade" onRequestClose={() => setShowAvatar(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowAvatar(false)}
          className="flex-1 bg-black/80 items-center justify-center">
          <View className="w-64 h-64 rounded-full overflow-hidden border-4 border-white/20">
            {avatarFull ? (
              <Image source={{ uri: avatarFull }} style={{ width: 256, height: 256 }} resizeMode="cover" />
            ) : null}
          </View>
          <Text className="text-white/60 text-[13px] mt-4">{name}</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Destaque do XP total — o detalhe de progresso/próxima patente fica no RankCard abaixo.
function XpProgress({ totalXp }: { totalXp: number }) {
  const { t } = useTranslation();
  return (
    <View className="bg-[#6B1221] rounded-[16px] px-5 py-4 flex-row items-center justify-between">
      <Text className="text-[10px] font-bold text-white/40 tracking-[2px] uppercase">
        {t('profile.totalXp')}
      </Text>
      <Text className="text-[26px] font-extrabold text-accent-500">
        {totalXp.toLocaleString()}
        <Text className="text-[13px] font-bold text-white/30"> {t('common.xp')}</Text>
      </Text>
    </View>
  );
}

function LocalCard({
  country,
  province,
  track,
}: {
  country: UserCountry | null;
  province: string | null;
  track: string | null;
}) {
  const { t } = useTranslation();
  return (
    <View className="rounded-[16px] p-5 bg-accent-500">
      <Text className="text-[11px] font-semibold text-[#3d2900]/70 tracking-[3px] uppercase">
        {t('profile.locationTitle')}
      </Text>
      <View className="h-3.5" />
      <View className="gap-3">
        {/* País — usa o ícone do país (SVG remoto → SvgUri; Image não renderiza SVG) */}
        <LocalRow
          label={t('profile.country')}
          value={country?.name ?? '—'}
          chip={<CountryIcon url={country?.icon_url ?? null} />}
        />
        <LocalRow label={t('profile.province')} value={province ?? '—'} chip={<Text className="text-[15px]">📍</Text>} />
        <LocalRow
          label={t('profile.track')}
          value={track ?? t('profile.noTrack')}
          chip={<Text className="text-[15px]">🛡️</Text>}
        />
      </View>
    </View>
  );
}

// Ícone de país: os assets são SVG (countries/<id>/<slug>.svg). <Image> não
// renderiza SVG remoto, então usamos SvgUri; raster (.png) cai no <Image>.
function CountryIcon({ url }: { url: string | null }) {
  if (!url) return <Text className="text-[16px]">🏛️</Text>;
  if (url.toLowerCase().endsWith('.svg')) {
    return <SvgUri uri={url} width={22} height={22} />;
  }
  return <Image source={{ uri: url }} style={{ width: 22, height: 22 }} resizeMode="contain" />;
}

function LocalRow({ label, value, chip }: { label: string; value: string; chip: React.ReactNode }) {
  return (
    <View className="flex-row items-center">
      <View className="w-9 h-9 rounded-full bg-white/30 items-center justify-center overflow-hidden mr-3">
        {chip}
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-bold text-[#3d2900]/60 uppercase tracking-[1px]">{label}</Text>
        <Text className="text-[15px] font-extrabold text-[#3d2900]" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase mb-2">
      {text}
    </Text>
  );
}

function StatCard({ value, label, loading }: { value: number; label: string; loading?: boolean }) {
  return (
    <View
      className="bg-white border border-[#f0eded] rounded-[14px] py-3.5 px-2 items-center"
      style={{ width: '31.5%' }}>
      {loading ? (
        <View className="h-7 w-10 bg-[#f0eded] rounded-[6px]" />
      ) : (
        <Text className="text-[20px] font-extrabold text-charcoal">{value.toLocaleString()}</Text>
      )}
      <Text className="text-[10px] text-[#999] mt-1 text-center" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function MasteryRow({ name, value }: { name: string; value: number }) {
  const Icon = MASTERY_ICONS[name.toLowerCase()];
  const pct = Math.max(0, Math.min(100, value));
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  return (
    <View>
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center">
          {Icon ? <Icon size={16} color="#6B1221" /> : null}
          <Text className="text-[13px] font-semibold text-charcoal ml-2">{label}</Text>
        </View>
        <Text className="text-[12px] font-bold text-[#888]">{value}/100</Text>
      </View>
      <View className="h-1.5 bg-[#f0eded] rounded-full overflow-hidden">
        <View className="h-1.5 bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3.5 ${last ? '' : 'border-b border-[#f4f1f1]'}`}>
      <Text className="text-[13px] text-[#888]">{label}</Text>
      <Text className="text-[14px] font-semibold text-charcoal" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
