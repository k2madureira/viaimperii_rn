import React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Leaderboard, LeaderboardItem } from '../../../../../api/leaderboards/leaderboardsApi';
import {
  EmptyBox,
  ErrorState,
  LeaderboardRow,
  LeaderboardSkeleton,
  ViewerPin,
} from '../../index';

// Corpo da tela: lista do placar + pin do viewer no rodapé (quando fora do
// top-N) + estados de loading/vazio/erro. O `header` vem do orquestrador.
interface Props {
  board: Leaderboard | undefined;
  isLoading: boolean;
  isError: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onRetry: () => void;
  showingHistory: boolean;
  currentUserId?: string;
  header: React.ReactElement;
  bottomInset: number;
}

export default function LeaderboardBody({
  board,
  isLoading,
  isError,
  refreshing,
  onRefresh,
  onRetry,
  showingHistory,
  currentUserId,
  header,
  bottomInset,
}: Props) {
  const { t } = useTranslation();
  const items = board?.items ?? [];
  const viewer = board?.viewer;

  // Pin quando o viewer está fora do top-N visível (posições são contíguas 1..N).
  const showPin =
    !!viewer && (viewer.position == null || viewer.position > items.length);

  const renderItem = ({ item }: { item: LeaderboardItem }) => (
    <LeaderboardRow
      item={item}
      prizeDenarii={!showingHistory ? board?.prizes?.[String(item.position)] : undefined}
      prizeDisplay={showingHistory ? item.prize_amount_display : undefined}
      highlight={!!currentUserId && String(item.user.id) === currentUserId}
    />
  );

  return (
    <FlatList
      data={isLoading || isError ? [] : items}
      keyExtractor={(item) => String(item.position)}
      renderItem={renderItem}
      ListHeaderComponent={<View style={{ paddingBottom: 12 }}>{header}</View>}
      contentContainerStyle={{ padding: 16, paddingBottom: bottomInset + 24, gap: 8 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9E1B32" />
      }
      ListEmptyComponent={
        isLoading ? (
          <LeaderboardSkeleton />
        ) : isError ? (
          <ErrorState onRetry={onRetry} />
        ) : (
          <EmptyBox text={t('leaderboards.empty')} />
        )
      }
      ListFooterComponent={
        showPin && !isLoading && !isError ? (
          <View style={{ paddingTop: items.length > 0 ? 8 : 0 }}>
            <ViewerPin viewer={viewer!} />
          </View>
        ) : null
      }
    />
  );
}
