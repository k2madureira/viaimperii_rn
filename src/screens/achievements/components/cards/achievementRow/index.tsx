import React from 'react';
import { Image, View } from 'react-native';
import Text from '../../../../../components/text';
import { SvgUri } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Achievement } from '../../../../../api/users/userApi';

interface Props {
  achievement: Achievement;
  unlocked: boolean;
}

export default function AchievementRow({ achievement, unlocked }: Props) {
  const { t } = useTranslation();
  return (
    <View
      className="flex-row items-center rounded-[14px] border p-3.5"
      style={{ backgroundColor: unlocked ? '#fff' : '#f6f6f6', borderColor: unlocked ? '#f0eded' : '#eee' }}>
      <View className="w-12 h-12 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden mr-3">
        {achievement.icon_url ? (
          achievement.icon_url.endsWith('.svg') ? (
            <SvgUri
              uri={achievement.icon_url}
              width={36}
              height={36}
              style={{ opacity: unlocked ? 1 : 0.3 }}
            />
          ) : (
            <Image
              source={{ uri: achievement.icon_url }}
              style={{ width: 36, height: 36, opacity: unlocked ? 1 : 0.3 }}
              resizeMode="contain"
            />
          )
        ) : (
          <Text className="text-[20px]" style={{ opacity: unlocked ? 1 : 0.3 }}>
            🏅
          </Text>
        )}
      </View>
      <View className="flex-1">
        <Text
          className="text-[14px] font-bold"
          style={{ color: unlocked ? '#1a1a1a' : '#999' }}
          numberOfLines={1}>
          {achievement.name}
        </Text>
        {achievement.description ? (
          <Text className="text-[12px] text-[#999]" numberOfLines={2}>
            {achievement.description}
          </Text>
        ) : null}
      </View>
      <View className="items-end ml-2">
        <Text className="text-[12px] font-bold" style={{ color: unlocked ? '#D4A017' : '#bbb' }}>
          +{achievement.xp_reward} {t('common.xp')}
        </Text>
        {unlocked && (
          <Text className="text-[10px] text-laurel font-semibold mt-0.5">
            {t('achievements.obtained')}
          </Text>
        )}
      </View>
    </View>
  );
}
