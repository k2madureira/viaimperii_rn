import { useQuery } from '@tanstack/react-query';
import { getStreak } from '../../../../api/streak/streakApi';

// Fonte fresca do streak (dias + escudos). O login já traz um snapshot, mas esta
// query dedicada reflete a compra de escudo sem re-logar. Habilitada sob demanda
// (ex.: ao abrir o tooltip de streak).
export function useStreak(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['streak', userId],
    queryFn: () => getStreak(userId as string),
    enabled: enabled && !!userId,
  });
}
