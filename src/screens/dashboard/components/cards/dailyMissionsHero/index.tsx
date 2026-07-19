import React, { useEffect, useRef, useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import ProgressRing from '../../../../../components/progressRing';
import { MissionAllowance } from '../../../../../api/missions/missionsApi';
import {
  DAILY_GOAL_REWARD_DENARIUS,
  DAILY_MISSION_GOAL,
  DAILY_MISSION_LIMIT,
} from '../../../../../constants/game';
import { useClaimDailyGoalReward } from '../../../model/mutations/useClaimDailyGoalReward';

interface Props {
  allowance?: MissionAllowance;
  onSeeAll: () => void;
}

const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

/**
 * Hero "Missões do dia" — tracker de progresso no topo da Home (acima do feed).
 * NÃO lista missões: mostra só o progresso da meta diária e leva à tela de Missões.
 *
 * O prêmio (bônus de 20 denários) só é contabilizado quando o usuário **de fato
 * conclui** as {DAILY_MISSION_GOAL} missões — `completedToday` vem da cota do backend
 * (só conta COMPLETED do dia SP), então nada é creditado antes disso.
 */
export default function DailyMissionsHero({ allowance, onSeeAll }: Props) {
  const { t } = useTranslation();

  const remaining = allowance?.daily ?? DAILY_MISSION_LIMIT;
  const completedToday = Math.max(0, DAILY_MISSION_LIMIT - remaining);
  const goalReached = completedToday >= DAILY_MISSION_GOAL;
  const progress = DAILY_MISSION_GOAL > 0 ? completedToday / DAILY_MISSION_GOAL : 0;

  // Bônus da meta: só dispara quando a meta é realmente atingida (5 conclusões).
  // O backend é idempotente por dia SP; toast só na 1ª concessão do dia.
  const claimM = useClaimDailyGoalReward();
  const spDate = allowance?.date ?? null;
  const handledRef = useRef<string | null>(null);
  const [rewarded, setRewarded] = useState(false);

  useEffect(() => {
    if (!goalReached) {
      setRewarded(false);
      return;
    }
    if (!spDate || handledRef.current === spDate) return;
    handledRef.current = spDate;

    claimM.mutate(undefined, {
      onSuccess: (res) => {
        setRewarded(true);
        if (!res.idempotent) {
          Toast.show({
            type: 'success',
            text1: t('dashboard.dailyHero.rewardToast'),
            text2: t('dashboard.dailyHero.rewardBonus', { count: DAILY_GOAL_REWARD_DENARIUS }),
          });
        }
      },
      onError: () => {
        handledRef.current = null;
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalReached, spDate]);

  // ── Meta batida (prêmio obtido) ────────────────────────────────────────────
  if (goalReached) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onSeeAll}
        className="bg-white border border-[#f0eded] rounded-[18px] p-3.5 flex-row items-center gap-3.5">
        <ProgressRing progress={1} size={46} strokeWidth={5} color="#2F7A52">
          <Text className="text-[16px] font-extrabold text-laurel leading-none">✓</Text>
        </ProgressRing>
        <View className="flex-1">
          <Text className="text-[15px] font-extrabold text-charcoal" style={{ fontFamily: serif }}>
            {t('dashboard.dailyHero.goalReached')}
          </Text>
          <Text className="text-[12px] text-[#888] mt-0.5">
            {rewarded
              ? t('dashboard.dailyHero.rewardBonus', { count: DAILY_GOAL_REWARD_DENARIUS })
              : t('dashboard.dailyHero.goalReachedSub')}
          </Text>
        </View>
        <Text className="text-[15px] text-primary-500 leading-none">›</Text>
      </TouchableOpacity>
    );
  }

  // ── Em progresso ───────────────────────────────────────────────────────────
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onSeeAll}
      className="bg-white border border-[#f0eded] rounded-[18px] p-4 flex-row items-center gap-3.5">
      <ProgressRing progress={progress} size={54} strokeWidth={5} color="#9E1B32">
        <Text className="text-[13px] font-extrabold text-charcoal leading-none">
          {Math.min(completedToday, DAILY_MISSION_GOAL)}
          <Text className="text-[10px] text-[#aaa]">/{DAILY_MISSION_GOAL}</Text>
        </Text>
      </ProgressRing>
      <View className="flex-1">
        <Text className="text-[16px] font-extrabold text-charcoal" style={{ fontFamily: serif }}>
          {t('dashboard.dailyHero.title')}
        </Text>
        <Text className="text-[12px] text-[#888] mt-0.5">
          {t('dashboard.dailyHero.goalProgress', { count: DAILY_MISSION_GOAL - completedToday })}
        </Text>
      </View>
      <View className="flex-row items-center gap-0.5">
        <Text className="text-[13px] font-bold text-primary-500">
          {t('dashboard.dailyHero.seeAll')}
        </Text>
        <Text className="text-[15px] text-primary-500 leading-none">›</Text>
      </View>
    </TouchableOpacity>
  );
}
