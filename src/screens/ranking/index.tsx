import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { RankingSection } from '../dashboard/components';
import { useRanking } from '../dashboard/model/queries/useRanking';

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const rankingQuery = useRanking();

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={rankingQuery.isRefetching}
            onRefresh={rankingQuery.refetch}
            tintColor="#8B1A2B"
          />
        }>
        <RankingSection
          ranking={rankingQuery.data?.ranking}
          isLoading={rankingQuery.isLoading}
          currentUserName={user?.name}
        />
      </ScrollView>
    </View>
  );
}
