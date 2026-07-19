import { useQuery } from '@tanstack/react-query';
import { getMission, Mission } from '../../../../api/missions/missionsApi';
import { parseBackendDate } from '../../../../utils/date';

/**
 * Pollar o status ao vivo de UMA missão (GET /missions/{slug}).
 *
 * A leitura finaliza a missão no backend se a janela de revisão já venceu, então
 * basta enquanto o status for `pending_review`. Ao virar `completed` (ou `in_progress`,
 * caso rejeitada) o polling para sozinho. Não usar /available — uma missão iniciada/
 * concluída sai daquela lista, e o status "sumiria".
 *
 * O intervalo é ADAPTATIVO à janela da própria missão (não martela o backend): bem
 * espaçado quando ainda falta muito tempo, e acelera só perto/depois do prazo.
 *
 * M2 — o SSE (`useMissionEvents`) é o canal PRIMÁRIO: aprovação/rejeição/conclusão
 * de pares invalidam `['mission-status', slug]` na hora, então NÃO dependemos do poll
 * para detectá-las. Longe do prazo o poll é só rede de segurança para a finalização
 * por tempo (que o job do backend também cobre), por isso pode ser bem espaçado —
 * o que reduz bateria/rede quando há várias missões ativas ao mesmo tempo.
 */
function intervalForRemaining(seconds: number): number {
  if (seconds <= 0) return 4000; // finalizando: confere a cada 4s
  if (seconds <= 30) return 6000; // reta final
  if (seconds <= 120) return 20000; // últimos minutos
  if (seconds <= 900) return 60000; // ~15 min antes do prazo: 1 min
  return 180000; // muito longe — SSE cobre as transições; poll só de segurança (3 min)
}

export function useMissionStatus(slug: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['mission-status', slug],
    queryFn: () => getMission(slug as string),
    enabled: enabled && !!slug,
    refetchInterval: (query) => {
      const data = query.state.data as Mission | undefined;
      if (!data || data.status !== 'pending_review') return false; // para de pollar

      // Tempo restante calculado do completable_at (UTC) — mais preciso que o snapshot.
      const target = parseBackendDate(data.completable_at)?.getTime() ?? null;
      const remaining =
        target != null
          ? Math.max(0, Math.round((target - Date.now()) / 1000))
          : data.remaining_seconds ?? 0;

      return intervalForRemaining(remaining);
    },
    staleTime: 0,
  });
}
