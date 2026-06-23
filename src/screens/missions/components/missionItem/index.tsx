import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Mission } from '../../../../api/missions/missionsApi';
import { parseBackendDate, formatBackendDateTime } from '../../../../utils/date';

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

  // Estado transitório: a janela acabou mas a lista ainda não trouxe `completed`.
  // Evita exibir contador zerado — mostra "Finalizando…" até o próximo refresh.
  const isFinalizing = remaining <= 0;

  // Ao entrar em "Finalizando…": primeiro refresh após 2s e, se a missão ainda não
  // finalizou (skew de relógio cliente↔servidor), tenta de novo a cada 3s — com teto
  // de tentativas. O backend finaliza de forma LAZY na leitura de /missions, então o
  // refetch é o gatilho. IMPORTANTE: invalida APENAS as queries de missões (refetchType
  // 'active', deduplicadas pelo React Query) — nunca o app inteiro; era a invalidação
  // global que travava a tela. O card desmonta ao virar `completed`, encerrando o ciclo.
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!isFinalizing) return;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const opts = { refetchType: 'active' as const };
      queryClient.invalidateQueries({ queryKey: ['missions'], ...opts });
      queryClient.invalidateQueries({ queryKey: ['missions-available'], ...opts });
      queryClient.invalidateQueries({ queryKey: ['user-stats'], ...opts });
      attempts += 1;
      if (attempts < 6) timer = setTimeout(tick, 3000);
    };
    timer = setTimeout(tick, 2000);
    return () => clearTimeout(timer);
  }, [isFinalizing, queryClient]);

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
