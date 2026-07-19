import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ArrowUpIcon, BellIcon } from '../../../../../components/icons';
import SecondaryNav from '../../buttons/secondaryNav';

interface Props {
  inMissionsMode: boolean;
  isReview: boolean;
  reviewBadge?: number;
  onReopenOnboarding: () => void;
  onOpenProgress: () => void;
  onOpenReview: () => void;
  onBackToMissions: () => void;
}

// ── C4 (ação-first): a tela abre direto nas Missões. Progresso e Revisão
// deixam de ser abas de igual peso e viram ACESSO SECUNDÁRIO no topo; nos
// modos secundários, um "voltar" retorna às Missões. ───────────────────────
export default function MissionsHeader({
  inMissionsMode,
  isReview,
  reviewBadge,
  onReopenOnboarding,
  onOpenProgress,
  onOpenReview,
  onBackToMissions,
}: Props) {
  const { t } = useTranslation();
  const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

  if (inMissionsMode) {
    return (
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[16px] font-extrabold text-charcoal" style={{ fontFamily: serif }}>
            {t('missions.tabMyMissions')}
          </Text>
          {/* B2: reabrir o mini-tour (some após a 1ª visita, mas fica acessível). */}
          <TouchableOpacity
            onPress={onReopenOnboarding}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('missions.onboarding.reopen')}
            className="w-5 h-5 rounded-full bg-[#efeaea] items-center justify-center">
            <Text className="text-[11px] font-bold text-[#9a8f8f]">?</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-2">
          <SecondaryNav icon={ArrowUpIcon} label={t('missions.tabProgress')} onPress={onOpenProgress} />
          <SecondaryNav
            icon={BellIcon}
            label={t('missions.tabReview')}
            badge={reviewBadge}
            onPress={onOpenReview}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        onPress={onBackToMissions}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t('missions.tabMyMissions')}
        className="w-8 h-8 rounded-full bg-[#efeaea] items-center justify-center">
        <Text className="text-[18px] font-bold text-primary-500">‹</Text>
      </TouchableOpacity>
      <Text className="text-[16px] font-extrabold text-charcoal" style={{ fontFamily: serif }}>
        {isReview ? t('missions.tabReview') : t('missions.tabProgress')}
      </Text>
    </View>
  );
}
