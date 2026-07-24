import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// Catálogo de profissões do mercado (todas; o filtro por trilha/especialidade é
// aplicado no cliente para derivar as especialidades disponíveis da trilha).
export function useProfessions(enabled = true) {
  return useQuery({
    queryKey: ['professions'],
    queryFn: () => viaimperiiApi.professions.catalog({ perPage: 100 }),
    enabled,
  });
}

// Profissões que o usuário já possui (para marcar as adquiridas no catálogo).
export function useUserProfessions(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['user-professions', userId],
    queryFn: () => viaimperiiApi.professions.owned(userId!),
    enabled: enabled && !!userId,
  });
}
