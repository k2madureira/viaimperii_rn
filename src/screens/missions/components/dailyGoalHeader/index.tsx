import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ProgressRing from '../../../../components/progressRing';
import { FireIcon } from '../../../../components/icons';
import { LoginStreak } from '../../../../api/auth/authApi';
import { MissionAllowance } from '../../../../api/missions/missionsApi';
import { DAILY_MISSION_GOAL, DAILY_MISSION_LIMIT } from '../../../../constants/game';

interface Props {
  allowance?: MissionAllowance;
  streak?: LoginStreak | null;
}

const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

/**
 * Cabeçalho de meta diária da tela de Missões: anel de progresso do dia
 * (missões concluídas / meta) + chip da ofensiva de login para motivação.
 *
 * Obs.: a ofensiva (streak) é de LOGIN (§13.1), já garantida ao abrir o app —
 * por isso a cópia motiva sem alegar que a ofensiva "quebra" sem missão.
 */
export default function DailyGoalHeader({ allowance, streak }: Props) {
  const { t } = useTranslation();

  const remaining = allowance?.daily ?? DAILY_MISSION_LIMIT;
  const completedToday = Math.max(0, DAILY_MISSION_LIMIT - remaining);
  const goalReached = completedToday >= DAILY_MISSION_GOAL;
  const progress = DAILY_MISSION_GOAL > 0 ? completedToday / DAILY_MISSION_GOAL : 0;
  const missing = Math.max(0, DAILY_MISSION_GOAL - completedToday);
  const streakDays = streak?.current_streak ?? 0;
 
  return (
    <View className="bg-white border border-[#f0eded] rounded-[16px] p-4 flex-row items-center gap-3.5">
      <ProgressRing
        progress={progress}
        size={56}
        strokeWidth={5}
        color={goalReached ? '#2F7A52' : '#9E1B32'}>
        <Text className="text-[14px] font-extrabold text-charcoal leading-none">
          {Math.min(completedToday, DAILY_MISSION_GOAL)}
          <Text className="text-[10px] text-[#aaa]">/{DAILY_MISSION_GOAL}</Text>
        </Text>
      </ProgressRing>

      <View className="flex-1">
        <Text
          className="text-[15px] font-extrabold text-charcoal"
          style={{ fontFamily: serif }}>
          {t('missions.dailyGoal.title')}
        </Text>
        <Text className="text-[12px] text-[#888] mt-0.5 leading-[16px]">
          {goalReached
            ? t('missions.dailyGoal.reached')
            : t('missions.dailyGoal.missing', { count: missing })}
        </Text>
        {/* M7: relaciona a META (anel X/{{goal}}) com a COTA diária (slots do dia),
            evitando dois números "diários" soltos sem conexão. */}
        <Text className="text-[11px] text-[#b0a8a8] mt-1">
          {t('missions.dailyGoal.slots', { done: completedToday, limit: DAILY_MISSION_LIMIT })}
        </Text>
      </View>

      {streakDays > 0 && (
        <View className="items-center bg-accent-500/10 rounded-[12px] px-2.5 py-1.5">
          <FireIcon size={22} />
          <Text className="text-[11px] font-extrabold text-[#9a7b1f] mt-0.5">
            {t('missions.dailyGoal.streak', { count: streakDays })}
          </Text>
        </View>
      )}
    </View>
  );
}
