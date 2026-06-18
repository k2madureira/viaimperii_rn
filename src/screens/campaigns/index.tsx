import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';

function formatCampaignName(id: string) {
  return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CampaignsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const profileQuery = useUserProfile(user?.user_id);

  const campaigns = profileQuery.data?.user.completed_campaigns ?? [];

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar />
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
          <Text className="text-[15px] font-extrabold text-[#111]">Campanhas concluídas</Text>
          <Text className="text-[12px] text-[#999]">{campaigns.length}</Text>
        </View>

        {profileQuery.isLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color="#8B1A2B" />
          </View>
        ) : campaigns.length === 0 ? (
          <View className="bg-white border border-[#f0eded] rounded-[14px] py-10 items-center px-6">
            <Text className="text-[13px] text-[#999] text-center">
              Você ainda não concluiu nenhuma campanha.
            </Text>
          </View>
        ) : (
          <View className="bg-white border border-[#f0eded] rounded-[14px] overflow-hidden">
            {campaigns.map((c, idx) => (
              <View
                key={`${c}-${idx}`}
                className={`flex-row items-center px-4 py-3.5 ${idx > 0 ? 'border-t border-[#f4f1f1]' : ''}`}>
                <Text className="text-[16px] mr-3">🏛️</Text>
                <Text className="flex-1 text-[13px] font-semibold text-[#222]">
                  {formatCampaignName(c)}
                </Text>
                <Text className="text-[11px] font-bold text-primary">concluída</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
