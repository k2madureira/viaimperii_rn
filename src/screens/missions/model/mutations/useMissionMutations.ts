import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import {
  abandonMission,
  completeMission,
  MissionEvidence,
  PaginatedMissions,
  startMission,
} from '../../../../api/missions/missionsApi';

export function useStartMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => startMission(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['missions-available'] });
      // Hero "Missões do dia" (Home) consome as recomendadas / o briefing — sem
      // isso a missão iniciada continuava aparecendo na lista.
      queryClient.invalidateQueries({ queryKey: ['missions-recommended'] });
      queryClient.invalidateQueries({ queryKey: ['daily-briefing'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.startMissionError'), text2: error.message });
    },
  });
}

export function useCompleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { slug: string; evidence?: MissionEvidence }) =>
      completeMission(vars.slug, vars.evidence),
    onSuccess: (result, vars) => {
      // Reflete o novo status IMEDIATAMENTE nas listas em cache (['missions', ...]),
      // sem depender do refetch: o card em "Ativas" troca na hora para o painel de
      // revisão (pending_review) ou some (completed). O invalidate abaixo reconcilia.
      queryClient.setQueriesData<PaginatedMissions>({ queryKey: ['missions'] }, (old) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map((m) =>
            m.slug === vars.slug
              ? {
                  ...m,
                  status: result.status,
                  completable_at: result.completable_at,
                  remaining_seconds: result.remaining_seconds,
                  approvals_required: result.approvals_required,
                  approvals_count: result.approvals_count,
                  completed_at:
                    result.status === 'completed' ? new Date().toISOString() : m.completed_at,
                }
              : m,
          ),
        };
      });

      if (result.status === 'completed') {
        Toast.show({
          type: 'success',
          text1: result.promoted
            ? i18n.t('toasts.completePromoted', { rank: result.current_rank })
            : i18n.t('toasts.completeTitle'),
          text2: result.medal_earned
            ? i18n.t('toasts.completeXpWithMedal', { xp: result.xp_earned, medal: result.medal_earned })
            : i18n.t('toasts.completeXp', { xp: result.xp_earned }),
        });
      } else {
        // pending_review — entra na janela de revisão antes de conceder XP.
        Toast.show({
          type: 'success',
          text1: i18n.t('toasts.completeRequestedTitle'),
          text2:
            result.approvals_required > 0
              ? i18n.t('toasts.completeRequestedWithApproval')
              : i18n.t('toasts.completeRequestedNoApproval'),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['missions-available'] });
      // A aba "Disponíveis" abre no modo recomendado — sem invalidar esta chave a
      // missão recém-concluída continua aparecendo na lista.
      queryClient.invalidateQueries({ queryKey: ['missions-recommended'] });
      queryClient.invalidateQueries({ queryKey: ['daily-briefing'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.completeError'), text2: error.message });
    },
  });
}

export function useAbandonMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => abandonMission(slug),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: i18n.t('toasts.abandonTitle'), text2: i18n.t('toasts.abandonBody') });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['missions-available'] });
      queryClient.invalidateQueries({ queryKey: ['missions-recommended'] });
      queryClient.invalidateQueries({ queryKey: ['daily-briefing'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.abandonError'), text2: error.message });
    },
  });
}
