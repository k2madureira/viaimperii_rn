import { useQuery } from '@tanstack/react-query';
import { getUserSummary, StatsPeriod } from '../../../../api/users/userApi';

// Resumo de atividade do usuário logado (GET /users/me/summary), por bucket SP.
export function useUserSummary(period: StatsPeriod, enabled = true) {
  return useQuery({
    queryKey: ['user-summary', period],
    queryFn: () => getUserSummary(period),
    enabled,
  });
}
