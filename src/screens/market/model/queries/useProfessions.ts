import { useQuery } from '@tanstack/react-query';
import { getProfessions, getUserProfessions } from '../../../../api/professions/professionsApi';

// Catálogo de profissões do mercado.
export function useProfessions(enabled = true) {
  return useQuery({
    queryKey: ['professions'],
    queryFn: getProfessions,
    enabled,
  });
}

// Profissões que o usuário já possui (para marcar as adquiridas no catálogo).
export function useUserProfessions(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['user-professions', userId],
    queryFn: () => getUserProfessions(userId!),
    enabled: enabled && !!userId,
  });
}
