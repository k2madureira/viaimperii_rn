import { useQuery } from '@tanstack/react-query';
import { getWallet } from '../../../../api/wallet/walletApi';

export function useWallet(enabled = true) {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: getWallet,
    enabled,
  });
}
