import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '../../../../api/campaigns/campaignsApi';

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
    staleTime: 1000 * 60 * 10,
  });
}
