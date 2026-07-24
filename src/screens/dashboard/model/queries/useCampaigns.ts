import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: viaimperiiApi.campaigns.list,
    staleTime: 1000 * 60 * 10,
  });
}
