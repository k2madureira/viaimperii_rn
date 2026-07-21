import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import {
  connectLegionEvents,
  LegionSSEEvent,
  LegionVoteEventPayload,
} from '../../../../api/legionTreasury/legionEvents';
import { LegionTreasury, StandardProposal } from '../../../../api/legionTreasury';

// ── Conexão compartilhada ────────────────────────────────────────────────────
//
// O QG e a War Room usam este hook, e o React Navigation mantém a tela de baixo
// MONTADA ao empilhar a de cima — sem compartilhar, navegar de uma para a outra
// abriria duas conexões ao mesmo endpoint. Aqui há uma só, com contagem de
// assinantes: a última que sai é quem fecha.
type Subscriber = (event: LegionSSEEvent) => void;

const subscribers = new Set<Subscriber>();
let sharedDisconnect: (() => void) | null = null;

function fanOut(event: LegionSSEEvent) {
  subscribers.forEach((fn) => fn(event));
}

function subscribe(fn: Subscriber): () => void {
  subscribers.add(fn);
  if (!sharedDisconnect) sharedDisconnect = connectLegionEvents(fanOut);

  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0) {
      sharedDisconnect?.();
      sharedDisconnect = null;
    }
  };
}

// Fecha o stream com o app em segundo plano, mesmo com assinantes montados.
function suspend() {
  sharedDisconnect?.();
  sharedDisconnect = null;
}

function resume() {
  if (!sharedDisconnect && subscribers.size > 0) {
    sharedDisconnect = connectLegionEvents(fanOut);
  }
}

/**
 * Mantém a conexão SSE `GET /legions/events` enquanto a tela de legião está viva.
 *
 * O payload traz a apuração inteira, então a barra de 60% é atualizada
 * ESCREVENDO NO CACHE — sem refetch. Uma votação cujo progresso só anda no
 * pull-to-refresh faz o limiar parecer morto, que é o problema que o stream
 * resolve.
 *
 * Quando a votação RESOLVE (status != 'open'), o cache não dá conta: a
 * aprovação move saldo do cofre, hasteia estandarte ou destrava a Sala de
 * Guerra. Aí sim invalida, para o servidor devolver o mundo novo.
 *
 * Não é fonte da verdade — o estado persistido volta no próximo GET do cofre.
 *
 * @param legionId - legião do viewer; sem ela não há o que ouvir.
 * @param enabled  - false para não conectar (ex.: tela sem legião).
 */
export function useLegionVoteEvents(legionId: number | undefined, enabled = true) {
  const queryClient = useQueryClient();

  function applyTally(vote: LegionVoteEventPayload) {
    queryClient.setQueryData<LegionTreasury>(['legion-treasury', legionId], (data) => {
      if (!data) return data;

      const patch = (p: StandardProposal): StandardProposal =>
        p.id === vote.proposal_id
          ? {
              ...p,
              status: vote.status,
              votes_yes: vote.votes_yes,
              votes_no: vote.votes_no,
              approval_pct: vote.approval_pct,
              resolved_at: vote.resolved_at,
              resolution_note: vote.resolution_note,
            }
          : p;

      return {
        ...data,
        open_proposals: (data.open_proposals ?? []).map(patch),
        open_proposal: data.open_proposal ? patch(data.open_proposal) : data.open_proposal,
      };
    });
  }

  function handleEvent(event: LegionSSEEvent) {
    switch (event.event) {
      case 'connected':
        if (__DEV__) console.log('[LEGION-SSE] conectado:', event.user);
        break;

      case 'legion_vote_updated': {
        const vote = event.vote;
        // O stream é da legião do usuário, mas checar evita aplicar um evento
        // de outra legião caso a assinatura mude no futuro.
        if (legionId != null && vote.legion_id !== legionId) return;

        if (vote.status === 'open') {
          applyTally(vote);
          return;
        }

        // Resolveu: o desfecho mexe em saldo, estandarte e acesso à Sala —
        // nada disso está no payload, então relê do servidor.
        queryClient.invalidateQueries({ queryKey: ['legion-treasury', legionId] });
        queryClient.invalidateQueries({ queryKey: ['legion-standard-proposals', legionId] });
        if (vote.kind === 'war_room') {
          queryClient.invalidateQueries({ queryKey: ['legion-leaderboard'] });
        }
        break;
      }

      default:
        break;
    }
  }

  useEffect(() => {
    if (!enabled || legionId == null) return;

    // Assina a conexão compartilhada; se for o primeiro, ela é aberta aqui.
    const unsubscribe = subscribe(handleEvent);

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') resume();
      else suspend();
    });

    return () => {
      sub.remove();
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, legionId]);
}
