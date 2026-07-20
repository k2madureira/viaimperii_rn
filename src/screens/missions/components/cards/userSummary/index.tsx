import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { CoinAmount, MASTERY_ICONS } from '../../../../../components/icons';
import { UserActivitySummary } from '../../../../../api/users';

interface Props {
  summary?: UserActivitySummary;
  isLoading: boolean;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#2F7A52',
  medium: '#D4AF37',
  hard: '#9E1B32',
};

// coins vêm em contagens por denominação; convertemos ao atômico p/ reusar o
// formatador padrão (1 aureus = 100000 asses, 1 denário = 100).
function coinsToAtomic(c: UserActivitySummary['coins']): number {
  return c.aureus * 100000 + c.denarius * 100 + c.as;
}

function iconFor(name: string) {
  const key = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return MASTERY_ICONS[key];
}

/**
 * Resumo de atividade do usuário logado (aba Progresso): missões concluídas por
 * dificuldade e especialidade, moedas ganhas e rewards — por período (bucket SP).
 */
export default function UserSummary({ summary, isLoading }: Props) {
  const { t } = useTranslation();

  const cm = summary?.completedMissions;
  const totalMissions = cm ? cm.easy + cm.medium + cm.hard : 0;
  const coinsAtomic = summary ? coinsToAtomic(summary.coins) : 0;
  const specialties = Object.entries(summary?.completedSpecialties ?? {}).filter(
    ([, v]) => v > 0,
  );
  const rewards = summary?.rewards;

  return (
    <View className="bg-white border border-[#f0eded] rounded-[20px] p-4 gap-4">
      <Text className="text-[14px] font-extrabold text-charcoal">{t('missions.summary.title')}</Text>

      {isLoading ? (
        <View className="py-8 items-center">
          <ActivityIndicator color="#8B1A2B" />
        </View>
      ) : !summary ? (
        <Text className="text-[12px] text-[#999]">{t('missions.summary.empty')}</Text>
      ) : (
        <>
          {/* Missões concluídas por dificuldade */}
          <View className="gap-2">
            <Text className="text-[11px] font-bold text-[#999] uppercase tracking-[1px]">
              {t('missions.summary.missionsLabel', { total: totalMissions })}
            </Text>
            <View className="flex-row gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <View
                  key={d}
                  className="flex-1 rounded-[12px] py-2.5 items-center"
                  style={{ backgroundColor: `${DIFFICULTY_COLOR[d]}14` }}>
                  <Text
                    className="text-[18px] font-extrabold"
                    style={{ color: DIFFICULTY_COLOR[d] }}>
                    {cm?.[d] ?? 0}
                  </Text>
                  <Text className="text-[10px] font-bold" style={{ color: DIFFICULTY_COLOR[d] }}>
                    {t(`missionItem.difficulty.${d}`, { defaultValue: d })}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Por especialidade */}
          {specialties.length > 0 && (
            <View className="gap-2">
              <Text className="text-[11px] font-bold text-[#999] uppercase tracking-[1px]">
                {t('missions.summary.bySpecialty')}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {specialties.map(([name, count]) => {
                  const Icon = iconFor(name);
                  return (
                    <View
                      key={name}
                      className="flex-row items-center gap-1.5 bg-[#f7f4f2] rounded-full pl-2 pr-2.5 py-1">
                      {Icon ? <Icon size={14} color="#6B1221" /> : null}
                      <Text className="text-[11px] font-bold text-[#5b4a3a] capitalize">{name}</Text>
                      <Text className="text-[11px] font-extrabold text-charcoal">{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Moedas + rewards */}
          <View className="flex-row items-center justify-between border-t border-[#f4f1f1] pt-3">
            <View>
              <Text className="text-[10px] font-bold text-[#999] uppercase tracking-[1px] mb-1">
                {t('missions.summary.coinsEarned')}
              </Text>
              {coinsAtomic > 0 ? (
                <CoinAmount atomic={coinsAtomic} size={14} textColor="#9a7b1f" showSigla />
              ) : (
                <Text className="text-[13px] text-[#bbb]">—</Text>
              )}
            </View>
            {rewards && (rewards.xp > 0 || rewards.denarius > 0) && (
              <View className="items-end">
                <Text className="text-[10px] font-bold text-[#999] uppercase tracking-[1px] mb-1">
                  {t('missions.summary.rewards')}
                </Text>
                <View className="flex-row items-center gap-2">
                  {rewards.xp > 0 && (
                    <Text className="text-[13px] font-extrabold text-accent-500">
                      +{rewards.xp}
                      {t('common.xp')}
                    </Text>
                  )}
                  {rewards.denarius > 0 && (
                    <Text className="text-[13px] font-extrabold text-[#9a7b1f]">
                      +{rewards.denarius} {t('missions.summary.denarius')}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}
