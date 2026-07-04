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
 * espaçado quando ainda falta muito tempo, e acelera só perto/depois do prazo. Para
 * medium/hard (aprovação de pares pode finalizar antes), o teto garante detectar a
 * mudança em ~1 min.
 */
function intervalForRemaining(seconds: number): number {
  if (seconds <= 0) return 4000; // finalizando: confere a cada 4s
  if (seconds <= 30) return 6000; // reta final
  if (seconds <= 120) return 20000; // últimos minutos
  return 60000; // ainda longe — teto de 60s (pega aprovação/rejeição de pares)
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
