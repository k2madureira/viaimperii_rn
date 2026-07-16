import React from 'react';
import { Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MissionAllowance } from '../../../../../../api/missions/missionsApi';
import { ProfessionTheme } from '../../../../../../utils/color';
import { TypeTab } from '../..';

interface Props {
  theme: ProfessionTheme;
  missionType: 'daily' | 'monthly';
  onChangeType: (type: 'daily' | 'monthly') => void;
  allowance?: MissionAllowance;
  activeCount?: number;
  isBelowRecruitIV: boolean;
}

// ── Seletor de tipo: Diárias | Semanais (com saldo do tipo ativo) ────────
export default function ProfessionTypeSelector({
  theme,
  missionType,
  onChangeType,
  allowance,
  activeCount,
  isBelowRecruitIV,
}: Props) {
  const { t } = useTranslation();
  return (
    <View className="rounded-[16px] p-4 gap-3" style={{ backgroundColor: theme.header }}>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[10px] font-bold text-white/40 tracking-[2px] uppercase">
            {t('missions.missionType')}
          </Text>
          <Text
            className="text-[18px] font-extrabold text-white mt-0.5"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {missionType === 'daily' ? t('missions.dailyMissions') : t('missions.weeklyMissions')}
          </Text>
        </View>
        {activeCount != null && (
          <View
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: activeCount === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }}>
            <Text className={`text-[11px] font-bold ${activeCount === 0 ? 'text-white/40' : 'text-white'}`}>
              {activeCount === 0
                ? t('missions.exhausted')
                : t('missions.remaining', { count: activeCount })}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row rounded-[10px] p-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <TypeTab
          label={t('missions.daily')}
          active={missionType === 'daily'}
          count={allowance?.daily}
          onPress={() => onChangeType('daily')}
        />
        {!isBelowRecruitIV && (
          <TypeTab
            label={t('missions.weekly')}
            active={missionType === 'monthly'}
            count={allowance?.weekly}
            onPress={() => onChangeType('monthly')}
          />
        )}
      </View>
    </View>
  );
}
