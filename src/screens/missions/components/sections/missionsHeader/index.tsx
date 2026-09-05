import React from 'react';
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ArrowUpIcon, BellIcon, StarIcon } from '../../../../../components/icons';
import SecondaryNav from '../../buttons/secondaryNav';

interface Props {
  inMissionsMode: boolean;
  isReview: boolean;
  isFavorites: boolean;
  reviewBadge?: number;
  favoritesBadge?: number;
  onReopenOnboarding: () => void;
  onOpenProgress: () => void;
  onOpenReview: () => void;
  onOpenFavorites: () => void;
  onBackToMissions: () => void;
}

// ── C4 (ação-first): a tela abre direto nas Missões. Progresso e Revisão
// deixam de ser abas de igual peso e viram ACESSO SECUNDÁRIO no topo; nos
// modos secundários, um "voltar" retorna às Missões. ───────────────────────
export default function MissionsHeader({
  inMissionsMode,
  isReview,
  isFavorites,
  reviewBadge,
  favoritesBadge,
  onReopenOnboarding,
  onOpenProgress,
  onOpenReview,
  onOpenFavorites,
  onBackToMissions,
}: Props) {
  const { t } = useTranslation();
  const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

  if (inMissionsMode) {
    // Título em uma linha e os acessos secundários numa linha própria com rolagem
    // horizontal: com 3 pílulas (Favoritos + Progresso + Revisão) elas não cabem
    // ao lado do título em telas estreitas — o `flex-wrap` quebrava a fileira e
    // empurrava a Revisão para baixo. A rolagem mantém todas na mesma faixa.
    return (
      <View className="gap-2.5">
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 2 }}>
          <SecondaryNav
            icon={StarIcon}
            label={t('missions.tabFavorites')}
            badge={favoritesBadge}
            onPress={onOpenFavorites}
          />
          <SecondaryNav icon={ArrowUpIcon} label={t('missions.tabProgress')} onPress={onOpenProgress} />
          <SecondaryNav
            icon={BellIcon}
            label={t('missions.tabReview')}
            badge={reviewBadge}
            onPress={onOpenReview}
          />
        </ScrollView>
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
        {isReview
          ? t('missions.tabReview')
          : isFavorites
            ? t('missions.tabFavorites')
            : t('missions.tabProgress')}
      </Text>
    </View>
  );
}
