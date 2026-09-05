import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../../api';

// Público. "restam X de 100 vagas" + se a inscrição está aberta (§34).
export function useFounderAvailability(enabled = true) {
  return useQuery({
    queryKey: ['founder-availability'],
    queryFn: viaimperiiApi.founder.availability,
    enabled,
    staleTime: 30_000,
  });
}
