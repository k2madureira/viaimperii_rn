import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useDailyRewards } from './model/queries/useDailyRewards';
import { useWallet } from '../dashboard/model/queries/useWallet';
import WalletButton from '../dashboard/components/walletButton';
import { ErrorState } from './components';
import { RewardsBody } from './components/sections';

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const rewardsQuery = useDailyRewards(!!user);
  const walletQuery = useWallet(!!user);
  // A listagem já traz só regras ativas — não filtrar por is_active (não vem no item).
  const rewards = rewardsQuery.data ?? [];

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar
        rightExtra={walletQuery.data ? <WalletButton balance={walletQuery.data.balance} /> : null}
      />

      {rewardsQuery.isLoading ? (
        <View className="py-16 items-center">
          <ActivityIndicator color="#9E1B32" />
        </View>
      ) : rewardsQuery.isError ? (
        <ErrorState onRetry={() => rewardsQuery.refetch()} />
      ) : (
        <RewardsBody
          rewards={rewards}
          refreshing={rewardsQuery.isFetching}
          onRefresh={() => rewardsQuery.refetch()}
          bottomInset={insets.bottom}
        />
      )}
    </View>
  );
}
