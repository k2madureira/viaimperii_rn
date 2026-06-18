import { useQuery } from '@tanstack/react-query';
import { getSpecialties } from '../../../../api/specialties/specialtiesApi';

export function useSpecialties() {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties,
    staleTime: 1000 * 60 * 10, // dados de referência mudam pouco
  });
}
