import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';

function formatMissionName(id: string) {
  return id
    .replace(/^[a-z]+_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function MissionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const profileQuery = useUserProfile(user?.user_id);

  const missions = [...(profileQuery.data?.user.completed_missions ?? [])].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(),
  );

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Missões" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={profileQuery.isRefetching}
            onRefresh={profileQuery.refetch}
            tintColor="#8B1A2B"
          />
        }>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[15px] font-extrabold text-[#111]">Missões concluídas</Text>
          <Text className="text-[12px] text-[#999]">{missions.length}</Text>
        </View>

        {profileQuery.isLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color="#8B1A2B" />
          </View>
        ) : missions.length === 0 ? (
          <View className="bg-white border border-[#f0eded] rounded-[14px] py-10 items-center">
            <Text className="text-[13px] text-[#999]">Nenhuma missão concluída ainda.</Text>
          </View>
        ) : (
          <View className="bg-white border border-[#f0eded] rounded-[14px] overflow-hidden">
            {missions.map((m, idx) => (
              <View
                key={`${m.mission_id}-${idx}`}
                className={`flex-row items-center px-4 py-3 ${idx > 0 ? 'border-t border-[#f4f1f1]' : ''}`}>
                <View className="w-2 h-2 rounded-full bg-primary mr-3" />
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-[#222]">
                    {formatMissionName(m.mission_id)}
                  </Text>
                  <Text className="text-[11px] text-[#aaa]">{m.mission_id}</Text>
                </View>
                <Text className="text-[11px] text-[#999]">{formatDate(m.completed_at)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
