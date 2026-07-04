import React, { useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FireIcon } from '../../../../components/icons';
import { LoginStreak } from '../../../../api/auth/authApi';
import AnchoredPopover, { Anchor } from '../feed/AnchoredPopover';

interface Props {
  streak: LoginStreak;
}

// Botão de streak no topo direito da tela: chama com a porcentagem dentro,
// toque abre um tooltip com os detalhes (dias, bônus, próxima meta).
export default function StreakButton({ streak }: Props) {
  const { t } = useTranslation();
  const anchorRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const open = () =>
    anchorRef.current?.measureInWindow((x, y, w, h) => setAnchor({ x, y, width: w, height: h }));

  return (
    <>
      <View ref={anchorRef} collapsable={false}>
        <TouchableOpacity
          onPress={open}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.streakDays', { count: streak.current_streak })}
          className="w-9 h-9 items-center justify-center">
          <FireIcon size={30} />
          <View className="absolute inset-0 items-center justify-center" style={{ top: 4 }}>
            <Text className="text-[8px] font-extrabold text-white">{streak.bonus_pct}%</Text>
          </View>
        </TouchableOpacity>
      </View>

      <AnchoredPopover anchor={anchor} onClose={() => setAnchor(null)} width={230} align="right">
        <View className="p-4">
          <Text className="text-[13px] font-extrabold text-charcoal">
            {t('dashboard.streakDays', { count: streak.current_streak })}
          </Text>
          <Text className="text-[12px] text-[#888] mt-1.5 leading-[17px]">
            {streak.is_max_bonus
              ? t('dashboard.streakMax', { pct: streak.bonus_pct })
              : t('dashboard.streakBonus', { pct: streak.bonus_pct, next: streak.next_milestone })}
          </Text>
        </View>
      </AnchoredPopover>
    </>
  );
}
