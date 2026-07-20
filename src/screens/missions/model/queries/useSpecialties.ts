import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

export function useSpecialties() {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: viaimperiiApi.specialties.list,
    staleTime: 1000 * 60 * 10, // dados de referência mudam pouco
  });
}
