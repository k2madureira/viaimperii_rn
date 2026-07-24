import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

/**
 * Busca global (§19) com debounce. Só dispara para termos com >= 2 chars.
 * `keepPreviousData` evita piscar a lista enquanto o usuário digita.
 */
export function useGlobalSearch(query: string, limit = 10, delay = 300) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), delay);
    return () => clearTimeout(id);
  }, [query, delay]);

  const enabled = debounced.length >= 2;

  const result = useQuery({
    queryKey: ['global-search', debounced, limit],
    queryFn: () => viaimperiiApi.search.global(debounced, limit),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  // "Buscando" enquanto o texto ainda não estabilizou no debounce.
  const isDebouncing = enabled && debounced !== query.trim();

  return { ...result, enabled, isDebouncing, term: debounced };
}
