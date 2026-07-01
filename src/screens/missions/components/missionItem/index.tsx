import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Mission } from '../../../../api/missions/missionsApi';
import { formatBackendDateTime } from '../../../../utils/date';
import { useMissionStatus } from '../../model/queries/useMissionStatus';
import { useAuth } from '../../../../contexts/AuthContext';

interface Props {
  mission: Mission;
  onStart: (slug: string) => void;
  onComplete: (mission: Mission) => void;
  pending: boolean;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#2F7A52',
  medium: '#D4AF37',
  hard: '#9E1B32',
};

// Formata segundos restantes em "Xh Ymin", "Ymin Zs" ou "Zs".
function formatRemaining(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'Finalizando...';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

// Painel exibido enquanto a missão está em revisão (pending_review):
// countdown até a finalização automática + progresso de aprovações de pares.
function ReviewPanel({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const needsApproval = mission.approvals_required > 0;

  // Polla GET /missions/{slug} enquanto a missão está em revisão (este painel só
  // existe em pending_review). A leitura finaliza a missão no backend se a janela já
  // venceu; também detecta aprovação (→ completed) ou rejeição (→ in_progress) por pares.
  const queryClient = useQueryClient();
  const statusQuery = useMissionStatus(mission.slug, true);
  const liveStatus = statusQuery.data?.status;

  // Countdown ANCORADO no remaining_seconds do backend (fonte fresca = poll; fallback =
  // prop da lista) e decrementado pelo tempo decorrido LOCAL. Não usa o relógio absoluto
  // (completable_at) para não sofrer com skew do relógio do dispositivo — era isso que
  // fazia o contador do front zerar antes do backend.
  const backendRemaining = statusQuery.data?.remaining_seconds ?? mission.remaining_seconds ?? 0;
  const anchorRef = useRef({ remaining: backendRemaining, at: Date.now() });
  const [remaining, setRemaining] = useState<number>(Math.max(0, backendRemaining));

  // Reancora sempre que o backend trouxer um remaining_seconds novo (cada poll).
  useEffect(() => {
    anchorRef.current = { remaining: backendRemaining, at: Date.now() };
    setRemaining(Math.max(0, backendRemaining));
  }, [backendRemaining]);

  useEffect(() => {
    const id = setInterval(() => {
      const a = anchorRef.current;
      const elapsed = (Date.now() - a.at) / 1000;
      setRemaining(Math.max(0, Math.round(a.remaining - elapsed)));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Ao virar status terminal, invalida as listas UMA vez para o card sair de "Ativas"
  // e refletir o novo estado (Histórico se completed / volta a iniciar se rejeitada).
  useEffect(() => {
    if (!liveStatus || liveStatus === 'pending_review') return;
    const opts = { refetchType: 'active' as const };
    queryClient.invalidateQueries({ queryKey: ['missions'], ...opts });
    queryClient.invalidateQueries({ queryKey: ['missions-available'], ...opts });
    queryClient.invalidateQueries({ queryKey: ['user-stats'], ...opts });
    queryClient.invalidateQueries({ queryKey: ['user-profile'], ...opts });

    if (liveStatus === 'completed') {
      const xp = statusQuery.data?.xp_earned ?? mission.xp_reward;
      Toast.show({
        type: 'success',
        text1: t('missionItem.toastCompletedTitle'),
        text2: t('missionItem.toastCompletedXp', { xp }),
      });
    } else if (liveStatus === 'in_progress') {
      Toast.show({
        type: 'error',
        text1: t('missionItem.toastRejectedTitle'),
        text2: t('missionItem.toastRejectedBody'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveStatus, queryClient]);

  // "Finalizando…": a janela acabou (remaining <= 0) mas ainda está em revisão —
  // o próximo poll trará completed.
  const isFinalizing = remaining <= 0 && (liveStatus ?? 'pending_review') === 'pending_review';

  if (isFinalizing) {
    return (
      <View className="mt-3 bg-laurel/10 border border-laurel/30 rounded-[12px] p-3 flex-row items-center gap-2">
        <ActivityIndicator size="small" color="#2F7A52" />
        <Text className="text-[12px] font-bold text-laurel">{t('missionItem.finalizing')}</Text>
      </View>
    );
  }

  return (
    <View className="mt-3 bg-accent-500/10 border border-accent-500/30 rounded-[12px] p-3 gap-2.5">
      {/* Confirmação de envio + timer */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] font-bold text-[#9a7b1f] uppercase tracking-[1px]">
          ⏳ {t('missionItem.reviewLabel')}
        </Text>
        <Text className="text-[13px] font-extrabold text-[#7a5b00]">
          {formatRemaining(remaining)}
        </Text>
      </View>

      <Text className="text-[11px] text-[#7a5b00] leading-[16px]">
        ✓ {t('missionItem.reviewSubmitted')}
      </Text>

      <Text className="text-[11px] text-[#9a7b1f] leading-[15px]">
        {needsApproval
          ? t('missionItem.autoCompleteWithApproval')
          : t('missionItem.autoComplete')}
      </Text>

      {needsApproval && (
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] font-semibold text-[#7a5b00]">{t('missionItem.peerApprovals')}</Text>
            <Text className="text-[12px] font-extrabold text-[#7a5b00]">
              {mission.approvals_count}/{mission.approvals_required}
            </Text>
          </View>
          <View className="flex-row gap-1.5">
            {Array.from({ length: mission.approvals_required }).map((_, i) => (
              <View
                key={i}
                className={`flex-1 h-1.5 rounded-full ${
                  i < mission.approvals_count ? 'bg-accent-500' : 'bg-accent-500/25'
                }`}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export default function MissionItem({ mission, onStart, onComplete, pending }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isCompleted = mission.status === 'completed';
  const isInProgress = mission.status === 'in_progress';
  const isPendingReview = mission.status === 'pending_review';
  const diffColor = DIFFICULTY_COLOR[mission.difficulty ?? ''] ?? '#aaa';
  const completedAtLabel = formatBackendDateTime(mission.completed_at);

  // XP extra que a sequência de login (streak) credita sobre o valor base da
  // missão — mesmo bônus aplicado pelo backend em finalize_pending_mission().
  const streakBonusPct = user?.streak?.bonus_pct ?? 0;
  const streakBonusXp = Math.round((mission.xp_reward * streakBonusPct) / 100);

  return (
    <View
      className={`border rounded-[14px] p-4 ${
        isPendingReview
          ? 'border-accent-500/40 bg-[#fffdf5]'
          : isInProgress
            ? 'border-primary-500 bg-[#fdf7f8]'
            : isCompleted
              ? 'border-laurel/30 bg-[#f4faf6]'
              : 'border-[#f0eded] bg-white'
      }`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[14px] font-bold text-[#222]">{mission.name}</Text>
          <View className="flex-row items-center flex-wrap gap-x-2 mt-1.5">
            {mission.specialty_name && (
              <Text className="text-[11px] text-[#999]">{mission.specialty_name}</Text>
            )}
            {mission.difficulty && (
              <View
                className="px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${diffColor}18` }}>
                <Text className="text-[10px] font-bold" style={{ color: diffColor }}>
                  {t(`missionItem.difficulty.${mission.difficulty}`, { defaultValue: mission.difficulty })}
                </Text>
              </View>
            )}
            {mission.type && (
              <Text className="text-[10px] text-[#bbb]">
                {mission.type === 'daily' ? t('missionItem.typeDaily') : t('missionItem.typeWeekly')}
              </Text>
            )}
            {mission.proof_type && mission.proof_type !== 'none' && (
              <View className="px-1.5 py-0.5 rounded-full bg-[#eef2f7] flex-row items-center gap-1">
                <Text className="text-[9px]">📎</Text>
                <Text className="text-[10px] font-bold text-[#5b6b7f]">
                  {t('missionItem.requiresProof', {
                    type: t(`missionItem.proof.${mission.proof_type}`, {
                      defaultValue: t('missionItem.proofFallback'),
                    }),
                  })}
                </Text>
              </View>
            )}
          </View>

          {isCompleted && completedAtLabel && (
            <Text className="text-[11px] text-laurel mt-1.5">
              {t('missionItem.completedAt', { date: completedAtLabel })}
            </Text>
          )}
        </View>

        <View className="items-end gap-1">
          <Text className="text-[13px] font-extrabold text-accent-500">+{mission.xp_reward} {t('common.xp')}</Text>
          {streakBonusPct > 0 && streakBonusXp > 0 && !isCompleted && (
            <Text className="text-[10px] font-bold text-[#F2994A]">
              {t('missionItem.streakBonusXp', { xp: streakBonusXp, pct: streakBonusPct })}
            </Text>
          )}
          {isCompleted && (
            <View className="bg-laurel/15 rounded-full px-2 py-0.5">
              <Text className="text-[10px] font-bold text-laurel">{t('missionItem.completed')}</Text>
            </View>
          )}
          {isInProgress && (
            <View className="bg-primary-500/10 rounded-full px-2 py-0.5">
              <Text className="text-[10px] font-bold text-primary-500">{t('missionItem.inProgress')}</Text>
            </View>
          )}
          {isPendingReview && (
            <View className="bg-accent-500/20 rounded-full px-2 py-0.5">
              <Text className="text-[10px] font-bold text-[#9a7b1f]">{t('missionItem.inReview')}</Text>
            </View>
          )}
        </View>
      </View>

      {isPendingReview && <ReviewPanel mission={mission} />}

      {isInProgress && (
        <View className="mt-3">
          <TouchableOpacity
            disabled={pending}
            activeOpacity={0.85}
            onPress={() => onComplete(mission)}
            className="rounded-[10px] py-2.5 items-center bg-primary-500">
            {pending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-[13px] font-bold text-white">{t('missionItem.completeMission')}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!isCompleted && !isInProgress && !isPendingReview && (
        <View className="mt-3">
          <TouchableOpacity
            disabled={pending}
            activeOpacity={0.85}
            onPress={() => onStart(mission.slug)}
            className="rounded-[10px] py-2.5 items-center bg-[#6B1221]">
            {pending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-[13px] font-bold text-white">{t('missionItem.startMission')}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
