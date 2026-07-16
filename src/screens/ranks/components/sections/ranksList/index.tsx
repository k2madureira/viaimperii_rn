import React from 'react';
import { ActivityIndicator, LayoutChangeEvent, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Rank } from '../../../../../api/ranks/ranksApi';
import { UserTrack } from '../../../../../api/users/userApi';
import { TOP_SECRET_RANKS } from '../../../../../constants/ranks';
import RankRow from '../../cards/rankRow';
import ErrorState from '../../feedback/errorState';

interface Props {
  ranks: Rank[];
  currentLevel: number;
  userTrack: UserTrack | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onCurrentLayout: (e: LayoutChangeEvent) => void;
}

// Lista de todas as patentes da trilha selecionada.
export default function RanksList({
  ranks,
  currentLevel,
  userTrack,
  isLoading,
  isError,
  onRetry,
  onCurrentLayout,
}: Props) {
  const { t } = useTranslation();

  return (
    <View>
      <Text className="text-[15px] font-extrabold text-[#111] mb-3">{t('ranks.allRanks')}</Text>

      {isLoading ? (
        <View className="py-12 items-center">
          <ActivityIndicator color="#8B1A2B" />
        </View>
      ) : isError ? (
        <ErrorState onRetry={onRetry} />
      ) : (
        <View className="bg-white border border-[#f0eded] rounded-[14px] overflow-hidden">
          {ranks.map((r, idx) => (
            <RankRow
              key={r.id}
              rank={r}
              currentLevel={currentLevel}
              userTrack={userTrack}
              isFirst={idx === 0}
              isTopSecret={idx >= ranks.length - TOP_SECRET_RANKS}
              onLayout={r.level === currentLevel ? onCurrentLayout : undefined}
            />
          ))}
        </View>
      )}
    </View>
  );
}
