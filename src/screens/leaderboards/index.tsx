import React, { useMemo, useState } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import ScreenContainer from '../../components/screenContainer';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WalletButton } from '../dashboard/components';
import { useWallet } from '../dashboard/model/queries/useWallet';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { LeaderboardScope } from '../../api/leaderboards/leaderboardsApi';
import { useLeaderboardScopes } from './model/queries/useLeaderboardScopes';
import { useLeaderboard } from './model/queries/useLeaderboard';
import { useLeaderboardHistory } from './model/queries/useLeaderboardHistory';
import { LeaderboardBody, LeaderboardHeader } from './components/sections';

type LeaderboardsRoute = RouteProp<HomeStackParamList, 'Leaderboards'>;

export default function LeaderboardsScreen() {
  const route = useRoute<LeaderboardsRoute>();
  const params = route.params ?? {};
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const walletQuery = useWallet(!!user);
  const scopesQuery = useLeaderboardScopes(!!user);
  const scopes = scopesQuery.data;

  // Escopo inicial e modo (vindo de uma notificação de prêmio → histórico).
  const [activeScope, setActiveScope] = useState<LeaderboardScope>(params.scope ?? 'global');
  const [showingHistory, setShowingHistory] = useState<boolean>(
    params.isoYear != null && params.isoWeek != null,
  );

  // Abas resolvíveis para o viewer (global sempre; demais só se existirem).
  const availableScopes = useMemo<LeaderboardScope[]>(() => {
    const list: LeaderboardScope[] = [];
    if (scopes?.global_available !== false) list.push('global');
    if (scopes?.legion) list.push('legion');
    if (scopes?.province) list.push('province');
    if (scopes?.professions?.length) list.push('profession');
    return list;
  }, [scopes]);

  // Resolve scopeId / professionId do escopo ativo a partir dos escopos do viewer.
  const { scopeId, professionId } = useMemo(() => {
    switch (activeScope) {
      case 'legion':
        return { scopeId: scopes?.legion?.id ?? null, professionId: null };
      case 'province':
        return { scopeId: scopes?.province?.id ?? null, professionId: null };
      case 'profession':
        return { scopeId: null, professionId: scopes?.professions?.[0]?.id ?? null };
      default:
        return { scopeId: null, professionId: null };
    }
  }, [activeScope, scopes]);

  // Escopos != global precisam dos ids resolvidos pelo /scopes.
  const scopesReady = activeScope === 'global' || scopesQuery.isSuccess;

  const liveQuery = useLeaderboard(
    activeScope,
    scopeId,
    professionId,
    !!user && !showingHistory && scopesReady,
  );
  const historyQuery = useLeaderboardHistory(
    activeScope,
    scopeId,
    professionId,
    params.isoYear ?? null,
    params.isoWeek ?? null,
    !!user && showingHistory && scopesReady,
  );

  const active = showingHistory ? historyQuery : liveQuery;
  const board = active.data;
  const isLoading = active.isLoading || (!scopesReady && scopesQuery.isLoading);

  const onRefresh = () => {
    scopesQuery.refetch();
    active.refetch();
  };

  const header = (
    <LeaderboardHeader
      scopes={availableScopes}
      activeScope={activeScope}
      onScopeChange={setActiveScope}
      weekEnd={board?.weekEnd ?? null}
      showingHistory={showingHistory}
      onToggleHistory={setShowingHistory}
    />
  );

  return (
    <ScreenContainer>
      <Navbar
        rightExtra={walletQuery.data ? <WalletButton balance={walletQuery.data.balance} /> : null}
      />

      <LeaderboardBody
        board={board}
        isLoading={isLoading}
        isError={active.isError}
        refreshing={active.isRefetching}
        onRefresh={onRefresh}
        onRetry={() => active.refetch()}
        showingHistory={showingHistory}
        currentUserId={user?.user_id}
        header={header}
        bottomInset={insets.bottom}
      />
    </ScreenContainer>
  );
}
