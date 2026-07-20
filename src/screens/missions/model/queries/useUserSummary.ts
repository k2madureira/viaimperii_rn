import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { StatsPeriod } from '../../../../api/users';

// Resumo de atividade do usuário logado (GET /users/me/summary), por bucket SP.
export function useUserSummary(period: StatsPeriod, enabled = true) {
  return useQuery({
    queryKey: ['user-summary', period],
    queryFn: () => viaimperiiApi.users.summary(period),
    enabled,
  });
}
