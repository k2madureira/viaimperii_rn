import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLegion } from '../../api/legion/legionApi';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';

export default function LegionScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const profileQuery = useUserProfile(user?.user_id);

  // legion_id não vem no UserSchema do GET; usamos o que veio no login.
  const legionId = user?.legion_id ?? null;

  const legionQuery = useQuery({
    queryKey: ['legion', legionId],
    queryFn: () => getLegion(legionId as number),
    enabled: !!legionId,
  });

  const legion = legionQuery.data;

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={legionQuery.isRefetching || profileQuery.isRefetching}
            onRefresh={() => {
              legionQuery.refetch();
              profileQuery.refetch();
            }}
            tintColor="#8B1A2B"
          />
        }>
        {!legionId ? (
          <View className="bg-white border border-[#f0eded] rounded-[14px] py-12 items-center px-6">
            <Text className="text-[14px] font-bold text-[#111] text-center">
              Você ainda não pertence a uma legião.
            </Text>
            <Text className="text-[12px] text-[#999] text-center mt-1">
              Avance no Império para ser convocado.
            </Text>
          </View>
        ) : legionQuery.isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator color="#8B1A2B" />
          </View>
        ) : legionQuery.isError || !legion ? (
          <View className="bg-white border border-[#f0eded] rounded-[14px] py-12 items-center px-6">
            <Text className="text-[13px] text-[#999] text-center">
              Não foi possível carregar sua legião.
            </Text>
          </View>
        ) : (
          <View className="bg-white border border-[#f0eded] rounded-[16px] p-6 items-center">
            <View className="w-20 h-20 rounded-full bg-[#f4eaea] items-center justify-center">
              <Text className="text-[34px]">{legion.symbol ?? '🦅'}</Text>
            </View>
            <View className="h-4" />
            <Text
              className="text-[22px] font-extrabold text-[#111] text-center"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              {legion.name}
            </Text>
            {legion.description && (
              <>
                <View className="h-3" />
                <Text className="text-[13px] text-[#555] text-center leading-[20px]">
                  {legion.description}
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
