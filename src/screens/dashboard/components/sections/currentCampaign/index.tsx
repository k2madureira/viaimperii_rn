import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Campaign } from '../../../../../api/campaigns/campaignsApi';

interface Props {
  campaigns: Campaign[];
  completedMissionIds: Set<string>;
  completedCampaignIds: Set<string>;
  onContinue: () => void;
}

function formatCampaignName(name: string) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// 3 — CAMPANHA ATUAL: a primeira campanha não concluída com progresso pendente.
export default function CurrentCampaign({
  campaigns,
  completedMissionIds,
  completedCampaignIds,
  onContinue,
}: Props) {
  const { t } = useTranslation();

  const active = campaigns
    .map((c) => {
      const done = c.required_missions.filter((m) => completedMissionIds.has(m)).length;
      return { campaign: c, done, total: c.required_missions.length };
    })
    .find(({ campaign, done, total }) => !completedCampaignIds.has(campaign.id) && done < total);

  if (!active) return null;

  return (
    <View className="bg-white border border-[#f0eded] rounded-[18px] p-5">
      <Text className="text-[15px] font-extrabold text-charcoal mb-1">
        📖 {t('dashboard.currentCampaignTitle')}
      </Text>
      <Text className="text-[14px] font-bold text-primary-500">
        {formatCampaignName(active.campaign.name)}
      </Text>
      <Text className="text-[12px] text-[#888] mt-1">
        {t('dashboard.missionsProgress', { done: active.done, total: active.total })}
      </Text>
      <View className="h-[6px] bg-[#f0eded] rounded-full overflow-hidden mt-2">
        <View
          className="h-full bg-laurel rounded-full"
          style={{ width: `${active.total > 0 ? (active.done / active.total) * 100 : 0}%` }}
        />
      </View>
      <TouchableOpacity
        onPress={onContinue}
        activeOpacity={0.9}
        className="border border-[#e6dada] rounded-[12px] py-2.5 items-center mt-4">
        <Text className="text-[13px] font-bold text-primary-500">
          {t('dashboard.continueCampaign')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
