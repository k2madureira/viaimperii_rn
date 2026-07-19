import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';

// Alterna entre o placar ao vivo (semana atual) e a última semana FECHADA
// (`/history`). Pílula dupla no padrão segmented.
interface Props {
  showingHistory: boolean;
  onToggle: (history: boolean) => void;
}

export default function HistoryToggle({ showingHistory, onToggle }: Props) {
  const { t } = useTranslation();
  return (
    <View className="flex-row bg-[#efeaea] rounded-[10px] p-0.5">
      <Toggle label={t('leaderboards.live')} active={!showingHistory} onPress={() => onToggle(false)} />
      <Toggle label={t('leaderboards.history')} active={showingHistory} onPress={() => onToggle(true)} />
    </View>
  );
}

function Toggle({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={active ? { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 } : undefined}
      className="px-3 py-1.5 rounded-[8px]">
      <Text className="text-[11.5px] font-bold" style={{ color: active ? '#9E1B32' : '#9a9a9a' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
