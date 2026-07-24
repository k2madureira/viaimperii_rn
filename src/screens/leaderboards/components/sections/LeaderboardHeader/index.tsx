import React from 'react';
import { ScrollView, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { LeaderboardScope } from '../../../../../api/leaderboards';
import { HistoryToggle, ResetCountdown, ScopeTab } from '../../index';

// Cabeçalho da tela: título + toggle live/histórico, fileira de abas de escopo
// (só as resolvíveis) e o countdown de reset da semana.
interface Props {
  scopes: LeaderboardScope[];
  activeScope: LeaderboardScope;
  onScopeChange: (scope: LeaderboardScope) => void;
  weekEnd: string | null;
  showingHistory: boolean;
  onToggleHistory: (history: boolean) => void;
}

export default function LeaderboardHeader({
  scopes,
  activeScope,
  onScopeChange,
  weekEnd,
  showingHistory,
  onToggleHistory,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={{ gap: 12 }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-[18px] font-extrabold text-charcoal">{t('leaderboards.title')}</Text>
        <HistoryToggle showingHistory={showingHistory} onToggle={onToggleHistory} />
      </View>

      {scopes.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
          {scopes.map((s) => (
            <ScopeTab
              key={s}
              label={t(`leaderboards.scope.${s}`)}
              active={s === activeScope}
              onPress={() => onScopeChange(s)}
            />
          ))}
        </ScrollView>
      )}

      {!showingHistory && weekEnd ? <ResetCountdown weekEnd={weekEnd} /> : null}
    </View>
  );
}
