import React from 'react';
import { ActivityIndicator, Modal, Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Legion } from '../../../../../api/legions/legionsApi';
import { TRACK_CHANGE_PENALTY_PCT } from '../../../../../constants/legions';
import { useJoinLegion } from '../../../../missions/model/mutations/useJoinLegion';

interface Props {
  visible: boolean;
  legion: Legion;
  totalXp: number;
  userId: string | undefined;
  onClose: () => void;
}

// Confirmação de troca de legião — mostra a penalidade de XP antes de aplicar.
export default function ChangeLegionModal({ visible, legion, totalXp, userId, onClose }: Props) {
  const { t } = useTranslation();
  const joinMutation = useJoinLegion(userId);

  const xpPenalty = Math.floor(totalXp * TRACK_CHANGE_PENALTY_PCT);
  const xpAfter = totalXp - xpPenalty;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full bg-white rounded-[20px] p-6">
          <View className="items-center">
            <View className="w-14 h-14 rounded-full bg-error/10 items-center justify-center mb-3">
              <Text className="text-[26px]">⚠️</Text>
            </View>
            <Text
              className="text-[18px] font-extrabold text-[#111] text-center"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              {t('legions.changeConfirmTitle')}
            </Text>
          </View>

          <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
            {t('legions.changeConfirmDesc', { name: legion.name })}
          </Text>

          {/* Penalty box */}
          <View className="bg-error/10 rounded-[12px] px-4 py-3 mt-4 gap-1.5">
            <Text className="text-[13px] font-bold text-error text-center">
              {t('legions.penaltyTitle')}
            </Text>
            <Text className="text-[12px] text-error/80 text-center leading-[17px]">
              {t('legions.penaltyDetail', {
                pct: Math.round(TRACK_CHANGE_PENALTY_PCT * 100),
                xpLoss: xpPenalty.toLocaleString(),
                xpAfter: xpAfter.toLocaleString(),
              })}
            </Text>
          </View>

          <View className="flex-row gap-3 mt-5">
            <TouchableOpacity
              onPress={onClose}
              disabled={joinMutation.isPending}
              activeOpacity={0.85}
              className="flex-1 border border-[#e0dada] rounded-[12px] py-3 items-center">
              <Text className="text-[14px] font-bold text-[#666]">{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => joinMutation.mutate(legion.id, { onSuccess: onClose })}
              disabled={joinMutation.isPending}
              activeOpacity={0.9}
              className="flex-1 bg-error rounded-[12px] py-3 items-center">
              {joinMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-[14px] font-bold text-white">{t('common.confirm')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
