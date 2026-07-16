import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Mission } from '../../../../../api/missions/missionsApi';
import { formatBackendDateTime } from '../../../../../utils/date';
import { useMissionStatus } from '../../../model/queries/useMissionStatus';
import { useAuth } from '../../../../../contexts/AuthContext';
import { ArrowUpIcon, CoinAmount, MASTERY_ICONS, PaperclipIcon, ShieldIcon } from '../../../../../components/icons';

interface Props {
  mission: Mission;
  onStart: (slug: string) => void;
  onComplete: (mission: Mission) => void;
  onAbandon: (mission: Mission) => void;
  // Chamado quando a missão finaliza (→ completed) durante a revisão, com o XP
  // creditado — usado para disparar a celebração na tela de Missões.
  onCompleted?: (xp: number) => void;
  // Motivos da recomendação (só missões do feed recomendado) — chips "por que" (F7).
  reasons?: string[];
  // Nome da trilha da missão (Legionários/Patrícios) — exibido nas de trilha (priority > 0).
  trackLabel?: string;
  // Cor de destaque do botão "Iniciar" — usada na tela de missões de profissão
  // para o card seguir a cor da profissão. Padrão: vinho imperial (#6B1221).
  accentColor?: string;
  pending: boolean;
  abandonPending: boolean;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#2F7A52',
  medium: '#D4AF37',
  hard: '#9E1B32',
};

// Ícone temático por especialidade (case-insensitive; MASTERY_ICONS usa "Engineering"…).
function resolveSpecialtyIcon(name?: string | null) {
  if (!name) return undefined;
  const key = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return MASTERY_ICONS[key];
}

// Formata segundos restantes em "Xh Ymin", "Ymin Zs" ou "Zs".
// B6: o rótulo de "finalizando" vem traduzido (i18n) do chamador — nada hardcoded.
function formatRemaining(totalSeconds: number, finalizingLabel: string): string {
  if (totalSeconds <= 0) return finalizingLabel;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

// Painel exibido enquanto a missão está em revisão (pending_review):
// countdown até a finalização automática + progresso de aprovações de pares.
function ReviewPanel({ mission, onCompleted }: { mission: Mission; onCompleted?: (xp: number) => void }) {
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
    queryClient.invalidateQueries({ queryKey: ['missions-recommended'], ...opts });
    queryClient.invalidateQueries({ queryKey: ['daily-briefing'], ...opts });
    queryClient.invalidateQueries({ queryKey: ['user-stats'], ...opts });
    queryClient.invalidateQueries({ queryKey: ['user-profile'], ...opts });

    if (liveStatus === 'completed') {
      const xp = statusQuery.data?.xp_earned ?? mission.xp_reward;
      // Com callback (tela de Missões) a celebração cobre o feedback; sem ele,
      // cai no toast tradicional.
      if (onCompleted) {
        onCompleted(xp);
      } else {
        Toast.show({
          type: 'success',
          text1: t('missionItem.toastCompletedTitle'),
          text2: t('missionItem.toastCompletedXp', { xp }),
        });
      }
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
          ⏳ {needsApproval ? t('missionItem.reviewLabel') : t('missionItem.pointsPendingLabel')}
        </Text>
        <Text className="text-[13px] font-extrabold text-[#7a5b00]">
          {formatRemaining(remaining, t('missionItem.finalizing'))}
        </Text>
      </View>

      {/* "Aguardando validação" só faz sentido quando há revisão de pares (medium/hard) —
          fáceis são só um timer, sem ninguém validando. */}
      {needsApproval && (
        <Text className="text-[11px] text-[#7a5b00] leading-[16px]">
          ✓ {t('missionItem.reviewSubmitted')}
        </Text>
      )}

      {/* Fáceis não passam por revisão de pares — evita a palavra "revisão"/"validação"
          e diz diretamente quando os pontos caem, âncorado no mesmo contador acima. */}
      <Text className="text-[11px] text-[#9a7b1f] leading-[15px]">
        {needsApproval
          ? t('missionItem.autoCompleteWithApproval')
          : t('missionItem.pointsCreditIn', { time: formatRemaining(remaining, t('missionItem.finalizing')) })}
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

export default function MissionItem({ mission, onStart, onComplete, onAbandon, onCompleted, reasons, trackLabel, accentColor, pending, abandonPending }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isCompleted = mission.status === 'completed';
  const isInProgress = mission.status === 'in_progress';
  const isPendingReview = mission.status === 'pending_review';
  const isAvailable = !isCompleted && !isInProgress && !isPendingReview;
  // Só medium/hard passam por aprovação de pares (§7); fáceis são só um timer.
  const needsApproval = mission.approvals_required > 0;

  // C1 — expectativa de recompensa explícita ANTES de concluir. Backend: fácil credita
  // na hora; médio/difícil passam por validação de pares (tempo reduzido pela metade).
  const rewardInstant = mission.difficulty === 'easy';
  const rewardReviewed = mission.difficulty === 'medium' || mission.difficulty === 'hard';

  // C2 — objetivo (critério de aceitação) visível antes de iniciar, sem precisar
  // aceitar a missão primeiro. Colapsado por padrão para não poluir o card.
  const hasObjective = !!mission.acceptance_criteria;
  const [objectiveOpen, setObjectiveOpen] = useState(false);
  const diffColor = DIFFICULTY_COLOR[mission.difficulty ?? ''] ?? '#aaa';
  const completedAtLabel = formatBackendDateTime(mission.completed_at);
  // Qualquer ação em andamento neste card trava as outras (evita duplo tap).
  const busy = pending || abandonPending;

  // Desistir é permitido em in_progress e pending_review (o backend não concede
  // XP em nenhum dos dois, então nada é perdido além do progresso/evidência).
  // M1 — confirmação por overlay padrão do app (§0.1 — nunca Alert nativo).
  const [abandonOpen, setAbandonOpen] = useState(false);
  const confirmAbandon = () => setAbandonOpen(true);

  // Bônus de XP por sequência de login — mesmo percentual aplicado pelo backend
  // em finalize_pending_mission().
  const streakBonusPct = user?.streak?.bonus_pct ?? 0;
  const SpecialtyIcon = resolveSpecialtyIcon(mission.specialty_name);
  // Cor da especialidade (vinda do backend); fallback para o vinho imperial.
  const specColor = mission.specialty_color ?? '#6B1221';

  // "Ativas" (em andamento / em revisão): o fundo e a borda usam um tom sutil da
  // própria cor da dificuldade — harmoniza com a faixa lateral (antes brigava com
  // os pastéis rosa/amarelo). O status fica a cargo do chip abaixo do cabeçalho.
  const isActive = isInProgress || isPendingReview;
  const cardStyle: {
    borderLeftWidth: number;
    borderLeftColor: string;
    backgroundColor?: string;
    borderColor?: string;
  } = { borderLeftWidth: 4, borderLeftColor: diffColor };
  if (isActive) {
    cardStyle.backgroundColor = `${diffColor}0D`; // ~5%
    cardStyle.borderColor = `${diffColor}33`; // ~20%
  }

  return (
    <View
      className={`border rounded-[16px] p-4 ${
        isCompleted
          ? 'border-laurel/30 bg-[#f4faf6]'
          : !isActive
            ? 'border-[#f0eded] bg-white'
            : ''
      }`}
      // Faixa lateral colorida pela dificuldade — dá identidade forte ao card (D6).
      style={cardStyle}>
      <View className="flex-row items-start">
        {/* Ícone temático da especialidade (identidade romana) */}
        <View
          className="w-11 h-11 rounded-[12px] items-center justify-center mr-3"
          style={{ backgroundColor: `${specColor}1A` }}>
          {SpecialtyIcon ? (
            <SpecialtyIcon size={22} color={specColor} />
          ) : (
            <Text className="text-[18px]">⚔️</Text>
          )}
        </View>

        {/* Nome + metadados */}
        <View className="flex-1 pr-2">
          <Text className="text-[15px] font-extrabold text-[#1c1c1c] leading-[19px]">
            {mission.name}
          </Text>
          {/* Linha 1 — pílulas (mesmo formato): dificuldade · trilha · prova */}
          <View className="flex-row items-center flex-wrap gap-1.5 mt-2">
            {mission.difficulty && (
              <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: diffColor }}>
                <Text className="text-[10px] font-extrabold text-white uppercase tracking-[0.5px]">
                  {t(`missionItem.difficulty.${mission.difficulty}`, { defaultValue: mission.difficulty })}
                </Text>
              </View>
            )}
            {(mission.priority ?? 0) > 0 && (
              <View className="px-2 py-0.5 rounded-full bg-[#eaeef7] flex-row items-center gap-1">
                <ShieldIcon size={10} color="#4a5a8a" />
                <Text className="text-[10px] font-bold text-[#4a5a8a]">
                  {trackLabel ?? t('missionItem.trackBadge')}
                </Text>
              </View>
            )}
            {mission.proof_type && mission.proof_type !== 'none' && (
              <View className="px-2 py-0.5 rounded-full bg-[#eef2f7] flex-row items-center gap-1">
                <PaperclipIcon size={10} color="#5b6b7f" />
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

          {/* Linha 2 — metadados sutis: especialidade · tipo */}
          {(mission.specialty_name || mission.type) && (
            <View className="flex-row items-center flex-wrap gap-1.5 mt-1.5">
              {mission.specialty_name && (
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: `${specColor}1A` }}>
                  <Text className="text-[10px] font-bold" style={{ color: specColor }}>
                    {mission.specialty_name}
                  </Text>
                </View>
              )}
              {mission.specialty_name && mission.type && (
                <View className="w-1 h-1 rounded-full bg-[#d0c8c8]" />
              )}
              {mission.type && (
                <Text className="text-[10px] text-[#9a9a9a]">
                  {mission.type === 'daily' ? t('missionItem.typeDaily') : t('missionItem.typeWeekly')}
                </Text>
              )}
            </View>
          )}

          {isCompleted && completedAtLabel && (
            <Text className="text-[11px] text-laurel mt-1.5">
              {t('missionItem.completedAt', { date: completedAtLabel })}
            </Text>
          )}
        </View>

        {/* Recompensa em destaque */}
        <View className="items-end ml-1">
          <View className="bg-accent-500/10 rounded-[10px] px-2.5 py-1.5 items-center">
            <Text className="text-[16px] font-extrabold text-accent-500 leading-none">
              +{mission.xp_reward}
            </Text>
            <Text className="text-[8px] font-extrabold text-accent-500/70 tracking-[1.5px] mt-0.5">
              {t('common.xp').trim().toUpperCase()}
            </Text>
          </View>
          {mission.coin_reward > 0 && (
            <View className="mt-1">
              <CoinAmount atomic={mission.coin_reward} size={11} textColor="#9a7b1f" />
            </View>
          )}
          {streakBonusPct > 0 && !isCompleted && (
            <View
              className="flex-row items-center gap-0.5 mt-1"
              accessible
              accessibilityLabel={t('missionItem.streakBonus', { pct: streakBonusPct })}>
              <ArrowUpIcon size={10} color="#2F7A52" />
              <Text className="text-[11px] font-extrabold text-laurel">+{streakBonusPct}%</Text>
            </View>
          )}
        </View>
      </View>

      {/* Chip de status (abaixo do cabeçalho) */}
      {(isCompleted || isInProgress || isPendingReview) && (
        <View className="flex-row mt-2.5">
          {isCompleted && (
            <View className="bg-laurel/15 rounded-full px-2.5 py-0.5">
              <Text className="text-[10px] font-bold text-laurel">{t('missionItem.completed')}</Text>
            </View>
          )}
          {isInProgress && (
            <View className="bg-primary-500/10 rounded-full px-2.5 py-0.5">
              <Text className="text-[10px] font-bold text-primary-500">{t('missionItem.inProgress')}</Text>
            </View>
          )}
          {isPendingReview && (
            <View className="bg-accent-500/20 rounded-full px-2.5 py-0.5">
              <Text className="text-[10px] font-bold text-[#9a7b1f]">
                {needsApproval ? t('missionItem.inReview') : t('missionItem.pointsPendingLabel')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Por que recomendada (F7) — só para missões disponíveis do feed recomendado */}
      {reasons && reasons.length > 0 && !isCompleted && !isInProgress && !isPendingReview && (
        <View className="flex-row items-center flex-wrap gap-1.5 mt-2.5">
          {reasons.slice(0, 2).map((r, i) => (
            <View
              key={i}
              className="flex-row items-center gap-1 bg-accent-500/10 rounded-full px-2 py-0.5">
              <Text className="text-[9px]">✨</Text>
              <Text className="text-[10px] font-semibold text-[#9a7b1f]" numberOfLines={1}>
                {r}
              </Text>
            </View>
          ))}
        </View>
      )}

      {isPendingReview && (
        <>
          <ReviewPanel mission={mission} onCompleted={onCompleted} />
          <View className="mt-2">
            <TouchableOpacity
              disabled={busy}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t('missionItem.abandonMission')}
              onPress={confirmAbandon}
              className="rounded-[10px] py-2 items-center border border-[#e0e0e0]">
              {abandonPending ? (
                <ActivityIndicator color="#888" size="small" />
              ) : (
                <Text className="text-[12px] font-bold text-[#888]">{t('missionItem.abandonMission')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {isInProgress && (rewardInstant || rewardReviewed) && (
        <View className="mt-3 flex-row items-start gap-1.5">
          <Text className="text-[11px]">{rewardInstant ? '⚡' : '👥'}</Text>
          <Text className="flex-1 text-[11px] text-[#888] leading-[15px]">
            {rewardInstant ? t('missionItem.rewardInstantHint') : t('missionItem.rewardReviewedHint')}
          </Text>
        </View>
      )}

      {isInProgress && (
        <View className="mt-2 flex-row gap-2">
          {/* Concluir = ação positiva (verde laurel), casa com o estado "Concluída". */}
          <TouchableOpacity
            disabled={busy}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('missionItem.completeMission')}
            onPress={() => onComplete(mission)}
            className="flex-1 rounded-[10px] py-2.5 items-center bg-laurel">
            {pending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-[13px] font-bold text-white">{t('missionItem.completeMission')}</Text>
            )}
          </TouchableOpacity>
          {/* Desistir = destrutivo (vermelho de contorno). Agora que "Concluir" é
              verde, o vermelho aqui contrasta bem (avançar x recuar) sem competir. */}
          <TouchableOpacity
            disabled={busy}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('missionItem.abandonMission')}
            onPress={confirmAbandon}
            className="rounded-[10px] py-2.5 px-4 items-center border-[1.5px] border-primary-500/50">
            {abandonPending ? (
              <ActivityIndicator color="#9E1B32" size="small" />
            ) : (
              <Text className="text-[13px] font-bold text-primary-500">{t('missionItem.abandonMission')}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* C1/C2 — antes de iniciar: como a recompensa cai (na hora × validação) +
          objetivo da missão (critério de aceitação) colapsável. */}
      {isAvailable && (rewardInstant || rewardReviewed || hasObjective) && (
        <View className="mt-3 gap-2">
          <View className="flex-row items-center flex-wrap gap-2">
            {rewardInstant && (
              <View className="flex-row items-center gap-1 bg-laurel/12 rounded-full px-2.5 py-1">
                <Text className="text-[10px]">⚡</Text>
                <Text className="text-[10px] font-bold text-laurel">{t('missionItem.rewardInstant')}</Text>
              </View>
            )}
            {rewardReviewed && (
              <View className="flex-row items-center gap-1 bg-[#eaeef7] rounded-full px-2.5 py-1">
                <Text className="text-[10px]">👥</Text>
                <Text className="text-[10px] font-bold text-[#4a5a8a]">{t('missionItem.rewardReviewed')}</Text>
              </View>
            )}
            {hasObjective && (
              <TouchableOpacity
                onPress={() => setObjectiveOpen((o) => !o)}
                activeOpacity={0.8}
                accessibilityRole="button"
                className="flex-row items-center gap-1 ml-auto">
                <Text className="text-[11px] font-bold text-primary-500">
                  {objectiveOpen ? t('missionItem.hideObjective') : t('missionItem.viewObjective')}
                </Text>
                <Text className="text-[9px] text-primary-500">{objectiveOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {hasObjective && objectiveOpen && (
            <View className="bg-[#f7f7f7] rounded-[10px] px-3 py-2.5">
              <Text className="text-[10px] font-bold text-[#999] uppercase tracking-[1px] mb-1">
                {t('missionItem.objectiveLabel')}
              </Text>
              <Text className="text-[12px] text-[#555] leading-[17px]">
                {mission.acceptance_criteria}
              </Text>
            </View>
          )}
        </View>
      )}

      {isAvailable && (
        <View className="mt-3">
          <TouchableOpacity
            disabled={pending}
            activeOpacity={0.85}
            onPress={() => onStart(mission.slug)}
            accessibilityRole="button"
            className="rounded-[10px] py-2.5 items-center"
            style={{ backgroundColor: accentColor ?? '#6B1221' }}>
            {pending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-[13px] font-bold text-white">{t('missionItem.startMission')}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* M1 — confirmação de "desistir" no padrão de overlay do app (nunca Alert nativo). */}
      <Modal
        transparent
        visible={abandonOpen}
        animationType="fade"
        onRequestClose={() => setAbandonOpen(false)}>
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="w-full bg-white rounded-[20px] p-6">
            <Text
              className="text-[18px] font-extrabold text-charcoal text-center"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              {t('missionItem.abandonConfirmTitle')}
            </Text>
            <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
              {t('missionItem.abandonConfirmBody')}
            </Text>
            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity
                onPress={() => setAbandonOpen(false)}
                activeOpacity={0.85}
                accessibilityRole="button"
                className="flex-1 border border-[#e0dada] rounded-[12px] py-3 items-center">
                <Text className="text-[14px] font-bold text-[#666]">{t('evidenceModal.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setAbandonOpen(false);
                  onAbandon(mission);
                }}
                activeOpacity={0.9}
                accessibilityRole="button"
                className="flex-1 bg-primary-500 rounded-[12px] py-3 items-center">
                <Text className="text-[14px] font-bold text-white">{t('missionItem.abandonConfirmAction')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
