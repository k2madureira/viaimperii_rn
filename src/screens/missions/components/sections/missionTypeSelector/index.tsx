import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MissionAllowance } from '../../../../../api/missions';
import { useRewardedVideo } from '../../../model/mutations/useRewardedVideo';
import TypeTab from '../../buttons/typeTab';
import AllowanceBar from '../../cards/allowanceBar';

interface Props {
  isBelowRecruitIV: boolean;
  missionType: 'daily' | 'monthly';
  onChangeType: (type: 'daily' | 'monthly') => void;
  allowance?: MissionAllowance;
  activeAllowanceCount: number | null;
  activeResetAt?: string;
}

// Seletor de tipo (Diárias/Semanais) + aviso de cota esgotada com renovação/vídeo.
// Abaixo de Recruta IV só há diárias fáceis: some o seletor, mas mantém o aviso.
export default function MissionTypeSelector({
  isBelowRecruitIV,
  missionType,
  onChangeType,
  allowance,
  activeAllowanceCount,
  activeResetAt,
}: Props) {
  const { t } = useTranslation();
  const { adState, watchAd } = useRewardedVideo();
  const quotaExhausted = !!allowance && activeAllowanceCount === 0 && !!activeResetAt;

  if (isBelowRecruitIV) {
    if (!quotaExhausted) return null;
    return (
      <AllowanceBar
        remaining={0}
        max={10}
        resetAt={activeResetAt}
        label={t('missions.dailyMissionsLower')}
        rewardedVideoAvailable={allowance?.rewarded_video_available ?? false}
        adState={adState}
        onWatchAd={watchAd}
      />
    );
  }

  return (
    <View className="gap-2">
      <View className="flex-row bg-[#efeaea] rounded-[12px] p-1">
        <TypeTab
          label={t('missions.daily')}
          active={missionType === 'daily'}
          activeColor="#9a7b1f"
          count={allowance?.daily}
          onPress={() => onChangeType('daily')}
        />
        <TypeTab
          label={t('missions.weekly')}
          active={missionType === 'monthly'}
          activeColor="#2F7A52"
          count={allowance?.weekly}
          onPress={() => onChangeType('monthly')}
        />
      </View>

      {/* Reset timer + botão de vídeo quando a cota do tipo ativo esgota */}
      {quotaExhausted && (
        <AllowanceBar
          remaining={0}
          max={missionType === 'daily' ? 10 : 2}
          resetAt={activeResetAt}
          label={missionType === 'daily' ? t('missions.dailyMissionsLower') : t('missions.weeklyMissionsLower')}
          rewardedVideoAvailable={
            missionType === 'daily' && (allowance?.rewarded_video_available ?? false)
          }
          adState={adState}
          onWatchAd={watchAd}
        />
      )}
    </View>
  );
}
