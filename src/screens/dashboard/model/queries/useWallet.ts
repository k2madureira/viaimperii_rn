import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

export function useWallet(enabled = true) {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: viaimperiiApi.wallet.balance,
    enabled,
  });
}
