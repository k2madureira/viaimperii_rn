import React from 'react';
import { Image, LayoutChangeEvent, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Rank } from '../../../../../api/ranks/ranksApi';
import { UserTrack } from '../../../../../api/users/userApi';
import { LockIcon } from '../../../../../components/icons';
import { CHOICE_RANK_LEVEL } from '../../../../../constants/ranks';

interface Props {
  rank: Rank;
  currentLevel: number;
  userTrack: UserTrack | null;
  isFirst: boolean;
  // Patentes do topo têm o XP oculto.
  isTopSecret: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
}

export default function RankRow({
  rank: r,
  currentLevel,
  userTrack,
  isFirst,
  isTopSecret,
  onLayout,
}: Props) {
  const { t } = useTranslation();
  const xpRequired = r.xp_required ?? 0;
  const isCurrent = r.level === currentLevel;
  const isAchieved = currentLevel > 0 && r.level <= currentLevel;
  const isChoiceRank = r.level === CHOICE_RANK_LEVEL;
  const isTrackSpecific = r.track_id != null;

  // Bloqueado se específico de trilha e o usuário não tem trilha
  // ou é de uma trilha diferente da sua
  const isLocked = isTrackSpecific && (!userTrack || r.track_id !== userTrack.id);

  return (
    <View
      onLayout={onLayout}
      className={`px-4 py-3 ${!isFirst ? 'border-t border-[#f4f1f1]' : ''} ${
        isChoiceRank ? 'bg-accent-500/10' : isCurrent ? 'bg-[#f4eaea]' : isLocked ? 'bg-[#f8f8f8]' : ''
      }`}>
      <View className="flex-row items-center">
        {/* Imagem da patente */}
        <View className="w-11 h-11 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden">
          {r.thumb_url ?? r.image_url ? (
            <Image
              source={{ uri: (r.thumb_url ?? r.image_url) as string }}
              style={{ width: 36, height: 36, opacity: isLocked ? 0.2 : isAchieved ? 1 : 0.35 }}
              resizeMode="contain"
            />
          ) : (
            <Text className="text-[12px] text-[#bbb] font-bold">{r.level}</Text>
          )}
        </View>

        <View className="flex-1 ml-3">
          <Text
            className={`text-[14px] font-semibold ${
              isLocked ? 'text-[#ccc]' : isCurrent ? 'text-primary-500' : isAchieved ? 'text-[#222]' : 'text-[#999]'
            }`}>
            {r.name}
            {isCurrent ? t('ranks.currentSuffix') : ''}
          </Text>
          <Text className={`text-[11px] ${isLocked ? 'text-[#ddd]' : 'text-[#aaa]'}`}>
            {t('ranks.level', { level: r.level })}
            {isLocked && !userTrack ? t('ranks.chooseTrackSuffix') : ''}
          </Text>
        </View>

        <View className="items-end">
          {isLocked ? (
            <LockIcon size={16} color="#ccc" strokeWidth={2} />
          ) : isTopSecret ? (
            <View className="items-end">
              <Text className="text-[15px] font-bold text-[#ccc]">{t('ranks.secretXp')}</Text>
              <Text className="text-[9px] text-[#ccc]">{t('ranks.secretXpHint')}</Text>
            </View>
          ) : (
            <>
              <Text className={`text-[13px] font-bold ${isAchieved ? 'text-[#333]' : 'text-[#bbb]'}`}>
                {xpRequired.toLocaleString()} {t('common.xp')}
              </Text>
              {isAchieved && !isCurrent && (
                <Text className="text-[10px] text-primary-500 font-semibold">{t('ranks.conquered')}</Text>
              )}
            </>
          )}
        </View>
      </View>

      {/* Banner de escolha de trilha — só aparece se o usuário ainda não tem trilha */}
      {isChoiceRank && !userTrack && (
        <View className="flex-row items-center mt-2.5 bg-accent-500/20 rounded-[10px] px-3 py-2">
          <Text className="text-[14px] mr-2">⚔️</Text>
          <View className="flex-1">
            <Text className="text-[12px] font-extrabold text-[#7a5b00]">
              {t('ranks.trackChoiceTitle')}
            </Text>
            <Text className="text-[11px] text-[#9a7b1f] leading-[15px]">
              {t('ranks.trackChoiceDescription')}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
