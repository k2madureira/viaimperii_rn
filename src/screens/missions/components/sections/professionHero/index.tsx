import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LockIcon, ShopIcon } from '../../../../../components/icons';
import LogoIcon from '../../../../../components/logoIcon';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useUserProfessions } from '../../../../market/model/queries/useProfessions';
import SparkleOverlay from '../../effects/sparkleOverlay';

// ── Opção 1: card HERO de missões de profissão (destaque no topo) ────
// Com profissão ativa: hero vinho + dourado com brilho, abre a tela dedicada.
// Bloqueado: teaser claro de upsell com CTA dourado → Mercado.
export default function ProfessionHero() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // Profissões adquiridas e ATIVAS do usuário — cada uma abre uma tela dedicada de
  // missões de profissão (só aparecem aqui quando há alguma desbloqueada).
  const userProfessionsQuery = useUserProfessions(user?.user_id, !!user);
  const activeProfessions = (userProfessionsQuery.data ?? [])
    .filter((up) => up.is_active)
    .map((up) => up.profession);
  const hasActiveProfessions = activeProfessions.length > 0;

  const onPress = () =>
    hasActiveProfessions
      ? navigation.navigate('ProfessionMissions', { profession: activeProfessions[0] })
      : navigation.navigate('Market');

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={t('missions.professionAccessTitle')}
      onPress={onPress}
      className="rounded-[18px] p-4 flex-row items-center gap-3.5 overflow-hidden"
      style={
        hasActiveProfessions
          ? { backgroundColor: '#6B1221', borderWidth: 1.5, borderColor: '#D4AF37' }
          : { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ece6e6' }
      }>
      {hasActiveProfessions && <SparkleOverlay radius={18} />}
      <View
        className="w-12 h-12 rounded-[14px] items-center justify-center"
        style={{ backgroundColor: hasActiveProfessions ? 'rgba(212,175,55,0.18)' : '#f7efdc' }}>
        {hasActiveProfessions ? (
          <LogoIcon size={26} color="#D4AF37" />
        ) : (
          <LockIcon size={22} color="#c8a24a" />
        )}
      </View>
      <View className="flex-1">
        <Text
          className="text-[15px] font-extrabold"
          style={{
            color: hasActiveProfessions ? '#fff' : '#3a2b2b',
            fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
          }}>
          {t('missions.professionAccessTitle')}
        </Text>
        <Text
          className="text-[12px] mt-0.5 leading-[16px]"
          style={{ color: hasActiveProfessions ? 'rgba(255,255,255,0.72)' : '#9a8f8f' }}>
          {hasActiveProfessions
            ? t('missions.professionAccessSubtitle')
            : t('missions.professionAccessLocked')}
        </Text>
      </View>
      {hasActiveProfessions ? (
        <Text className="text-[22px] font-bold" style={{ color: '#D4AF37' }}>›</Text>
      ) : (
        <View
          className="rounded-full px-3 py-2 flex-row items-center gap-1"
          style={{ backgroundColor: '#D4AF37' }}>
          <ShopIcon size={16} color="#6B1221" />
          <Text className="text-[11px] font-extrabold" style={{ color: '#6B1221' }}>
            {t('market.professions.buy')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
