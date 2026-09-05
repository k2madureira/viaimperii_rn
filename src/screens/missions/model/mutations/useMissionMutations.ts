import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { MissionEvidence, PaginatedMissions } from '../../../../api/missions';
import { isDuplicateImageError } from '../../../../utils/missionEvidence';

export function useStartMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => viaimperiiApi.missions.start(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['missions-available'] });
      // Hero "Missões do dia" (Home) consome as recomendadas / o briefing — sem
      // isso a missão iniciada continuava aparecendo na lista.
      queryClient.invalidateQueries({ queryKey: ['missions-recommended'] });
      queryClient.invalidateQueries({ queryKey: ['daily-briefing'] });
      // "Rotina do dia" (favoritas): sem isso o card ficava em "Iniciar" mesmo
      // depois de iniciada. A lista tem status por-usuário, então precisa relê.
      queryClient.invalidateQueries({ queryKey: ['missions-favorites'] });
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
      viaimperiiApi.missions.complete(vars.slug, vars.evidence),
    onSuccess: (result, vars) => {
      // Reflete o novo status IMEDIATAMENTE nas listas em cache, sem depender do
      // refetch: o card em "Ativas" troca na hora para o painel de revisão
      // (pending_review) ou some (completed). Aplica-se tanto às listas normais
      // (['missions', ...]) quanto à "Rotina do dia" (['missions-favorites']), que
      // tem o MESMO shape (PaginatedMissions) e deve mostrar o status do dia. O
      // invalidate abaixo reconcilia com o servidor.
      const patchList = (old: PaginatedMissions | undefined) => {
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
      };
      queryClient.setQueriesData<PaginatedMissions>({ queryKey: ['missions'] }, patchList);
      queryClient.setQueriesData<PaginatedMissions>({ queryKey: ['missions-favorites'] }, patchList);

      // Moderação assíncrona (flag MISSION_MODERATION_ASYNC): a evidência foi
      // parkeada e está em análise; a missão SEGUE in_progress no servidor e nenhum
      // XP é concedido ainda. Feedback próprio (sem celebração/legião/compartilhar,
      // tratados no chamador) e NÃO invalidamos as listas — o refetch traria
      // in_progress e apagaria o card "em análise" que o patch acima acabou de pôr.
      // O verdict (aprovado → pending_review/completed; reprovado → in_progress +
      // notificação) chega pelo SSE de missões, que então reconcilia as listas.
      if (result.status === 'moderating') {
        Toast.show({
          type: 'info',
          text1: i18n.t('toasts.moderatingTitle'),
          text2: i18n.t('toasts.moderatingBody'),
        });
        return;
      }

      // M6 — feedback ÚNICO de "XP creditado": no caso `completed` a tela exibe a
      // celebração (confete) — ou o modal de promoção, quando sobe de patente —, então
      // aqui NÃO disparamos um toast concorrente (evita toast + confete no mesmo evento
      // e alinha com a finalização assíncrona por tempo/aprovação, que já usa só a
      // celebração). O toast fica reservado ao `pending_review`, onde ainda não há XP.
      if (result.status !== 'completed') {
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
      queryClient.invalidateQueries({ queryKey: ['missions-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      // Conclusão imediata (status `completed`) credita moedas no ledger — atualiza a
      // carteira. No caso `pending_review` ainda não há moeda, mas o refetch é inócuo.
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (error: Error) => {
      // Dedup de imagem: o EvidenceModal já exibe o aviso inline — não duplicar em toast.
      if (isDuplicateImageError(error.message)) return;
      Toast.show({ type: 'error', text1: i18n.t('toasts.completeError'), text2: error.message });
    },
  });
}

export function useAbandonMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => viaimperiiApi.missions.abandon(slug),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: i18n.t('toasts.abandonTitle'), text2: i18n.t('toasts.abandonBody') });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['missions-available'] });
      queryClient.invalidateQueries({ queryKey: ['missions-recommended'] });
      queryClient.invalidateQueries({ queryKey: ['daily-briefing'] });
      queryClient.invalidateQueries({ queryKey: ['missions-favorites'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.abandonError'), text2: error.message });
    },
  });
}
