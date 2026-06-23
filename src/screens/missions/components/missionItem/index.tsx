import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Mission } from '../../../../api/missions/missionsApi';
import { parseBackendDate, formatBackendDateTime } from '../../../../utils/date';
import { useMissionStatus } from '../../model/queries/useMissionStatus';

interface Props {
  mission: Mission;
  onStart: (slug: string) => void;
  onComplete: (mission: Mission) => void;
  pending: boolean;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

// Tipo de prova exigida para concluir a missão (exibido como badge no card).
const PROOF_LABEL: Record<string, string> = {
  link: 'Link',
  image: 'Imagem',
  text: 'Texto',
  any: 'Evidência',
};

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
  const targetMs = parseBackendDate(mission.completable_at)?.getTime() ?? null;

  const computeRemaining = () => {
    if (targetMs != null) return Math.max(0, Math.round((targetMs - Date.now()) / 1000));
    return mission.remaining_seconds ?? 0;
  };

  const [remaining, setRemaining] = useState<number>(computeRemaining);

  useEffect(() => {
    setRemaining(computeRemaining());
    if (targetMs == null) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, Math.round((targetMs - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMs, mission.remaining_seconds]);

  const needsApproval = mission.approvals_required > 0;

  // Polla GET /missions/{slug} enquanto a missão está em revisão (este painel só
  // existe em pending_review). A leitura finaliza a missão no backend se a janela já
  // venceu; também detecta aprovação (→ completed) ou rejeição (→ in_progress) por pares.
  const queryClient = useQueryClient();
  const statusQuery = useMissionStatus(mission.slug, true);
  const liveStatus = statusQuery.data?.status;

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
      Toast.show({ type: 'success', text1: 'Missão concluída!', text2: `+${xp} XP creditados.` });
    } else if (liveStatus === 'in_progress') {
      Toast.show({
        type: 'error',
        text1: 'Evidência rejeitada',
        text2: 'Refaça a missão e reenvie a comprovação.',
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
        <Text className="text-[12px] font-bold text-laurel">Finalizando…</Text>
      </View>
    );
  }

  return (
    <View className="mt-3 bg-gold/10 border border-gold/30 rounded-[12px] p-3 gap-2.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] font-bold text-[#9a7b1f] uppercase tracking-[1px]">
          ⏳ Em revisão
        </Text>
        <Text className="text-[13px] font-extrabold text-[#7a5b00]">
          {formatRemaining(remaining)}
        </Text>
      </View>

      <Text className="text-[11px] text-[#9a7b1f] leading-[15px]">
        {needsApproval
          ? 'Conclui automaticamente quando o tempo acabar — ou na hora com 2 aprovações de pares.'
          : 'Conclui automaticamente quando o tempo de revisão acabar.'}
      </Text>

      {needsApproval && (
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] font-semibold text-[#7a5b00]">Aprovações de pares</Text>
            <Text className="text-[12px] font-extrabold text-[#7a5b00]">
              {mission.approvals_count}/{mission.approvals_required}
            </Text>
          </View>
          <View className="flex-row gap-1.5">
            {Array.from({ length: mission.approvals_required }).map((_, i) => (
              <View
                key={i}
                className={`flex-1 h-1.5 rounded-full ${
                  i < mission.approvals_count ? 'bg-gold' : 'bg-gold/25'
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
  const isCompleted = mission.status === 'completed';
  const isInProgress = mission.status === 'in_progress';
  const isPendingReview = mission.status === 'pending_review';
  const diffColor = DIFFICULTY_COLOR[mission.difficulty ?? ''] ?? '#aaa';
  const completedAtLabel = formatBackendDateTime(mission.completed_at);

  return (
    <View
      className={`border rounded-[14px] p-4 ${
        isPendingReview
          ? 'border-gold/40 bg-[#fffdf5]'
          : isInProgress
            ? 'border-primary bg-[#fdf7f8]'
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
                  {DIFFICULTY_LABEL[mission.difficulty] ?? mission.difficulty}
                </Text>
              </View>
            )}
            {mission.type && (
              <Text className="text-[10px] text-[#bbb]">
                {mission.type === 'daily' ? 'Diária' : 'Semanal'}
              </Text>
            )}
            {mission.proof_type && mission.proof_type !== 'none' && (
              <View className="px-1.5 py-0.5 rounded-full bg-[#eef2f7] flex-row items-center gap-1">
                <Text className="text-[9px]">📎</Text>
                <Text className="text-[10px] font-bold text-[#5b6b7f]">
                  Requer {PROOF_LABEL[mission.proof_type] ?? 'evidência'}
                </Text>
              </View>
            )}
          </View>

          {isCompleted && completedAtLabel && (
            <Text className="text-[11px] text-laurel mt-1.5">
              Concluída em {completedAtLabel}
            </Text>
          )}
        </View>

        <View className="items-end gap-1">
          <Text className="text-[13px] font-extrabold text-gold">+{mission.xp_reward} XP</Text>
          {isCompleted && (
            <View className="bg-laurel/15 rounded-full px-2 py-0.5">
              <Text className="text-[10px] font-bold text-laurel">Concluída</Text>
            </View>
          )}
          {isInProgress && (
            <View className="bg-primary/10 rounded-full px-2 py-0.5">
              <Text className="text-[10px] font-bold text-primary">Em andamento</Text>
            </View>
          )}
          {isPendingReview && (
            <View className="bg-gold/20 rounded-full px-2 py-0.5">
              <Text className="text-[10px] font-bold text-[#9a7b1f]">Em revisão</Text>
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
            className="rounded-[10px] py-2.5 items-center bg-primary">
            {pending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-[13px] font-bold text-white">Concluir missão</Text>
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
              <Text className="text-[13px] font-bold text-white">Iniciar missão</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
