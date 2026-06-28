import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import {
  completeMission,
  MissionEvidence,
  startMission,
} from '../../../../api/missions/missionsApi';

export function useStartMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => startMission(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['missions-available'] });
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
    onSuccess: (result) => {
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
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.completeError'), text2: error.message });
    },
  });
}
