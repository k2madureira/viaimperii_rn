import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { ChangePasswordModal } from '../dashboard/components';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const profileQuery = useUserProfile(user?.user_id);
  const [showPassword, setShowPassword] = useState(false);

  const data = profileQuery.data;
  const name = data?.user.name ?? user?.name ?? '—';
  const rank = data?.user.rank ?? user?.rank ?? '—';
  const totalXp = data?.user.total_xp ?? user?.total_xp ?? 0;
  const legion = data?.legion?.name ?? '—';
  const track = data?.track?.name ?? '—';
  const province = data?.province ? `${data.province.name}` : '—';
  const initial = name.trim().charAt(0).toUpperCase();
  const avatarUrl = data?.active_avatar?.url ?? null;

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      {/* Header com voltar */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-[#f0f0f0]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="pr-3">
          <Text className="text-[24px] text-[#333] leading-none">‹</Text>
        </TouchableOpacity>
        <Text
          className="text-sm font-semibold text-[#111] tracking-[3px]"
          style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {t('profile.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }}
        showsVerticalScrollIndicator={false}>
        {/* Cabeçalho do perfil */}
        <View className="items-center pt-2">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 80, height: 80 }} resizeMode="cover" />
            ) : (
              <Text className="text-[30px] font-extrabold text-white">{initial}</Text>
            )}
          </View>
          <Text
            className="text-[22px] font-extrabold text-charcoal mt-3"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {name}
          </Text>
          <Text className="text-[13px] text-[#888]">{user?.email}</Text>
        </View>

        {/* Dados */}
        <View className="bg-white border border-[#f0eded] rounded-[16px] overflow-hidden">
          <InfoRow label={t('profile.rank')} value={rank} />
          <InfoRow label={t('profile.totalXp')} value={`${totalXp.toLocaleString()} ${t('common.xp')}`} />
          <InfoRow label={t('profile.track')} value={track} />
          <InfoRow label={t('profile.legion')} value={legion} />
          <InfoRow label={t('profile.province')} value={province} last />
        </View>

        {/* Ações */}
        <TouchableOpacity
          onPress={() => setShowPassword(true)}
          activeOpacity={0.85}
          className="bg-white border border-[#f0eded] rounded-[14px] py-3.5 items-center">
          <Text className="text-[14px] font-bold text-charcoal">{t('profile.changePassword')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => signOut()}
          activeOpacity={0.85}
          className="bg-primary rounded-[14px] py-3.5 items-center">
          <Text className="text-[14px] font-bold text-white">{t('profile.signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <ChangePasswordModal
        visible={showPassword}
        isTemporary={false}
        onClose={() => setShowPassword(false)}
      />
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
