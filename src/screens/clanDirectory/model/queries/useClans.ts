import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// GET /clans — diretório de clãs (smart search por nome/tag). `q` vazio traz todos.
export function useClans(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: ['clans', term],
    queryFn: () => viaimperiiApi.clan.list({ q: term || undefined, perPage: 30 }),
    staleTime: 1000 * 30,
  });
}
