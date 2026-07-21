import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { BoardSortField } from '../../../../../api/legionLeaderboard';

interface Props {
  value: BoardSortField;
  color: string;
  onChange: (value: BoardSortField) => void;
}

// Ordem dos chips = ordem da leitura que queremos incentivar.
//
// `xp_week` primeiro (esforço da semana, o default do backend) e
// `avg_xp_per_active` logo em seguida — é ele que deixa legião pequena e
// dedicada competir com legião grande. Sem esse segundo, o board vira
// "grande vence", exatamente o que ordenar por tamanho produziria.
//
// `treasury` só entrou depois que o backend passou a somar o cofre DENTRO do
// agregado: antes ele reordenava a página já rankeada por XP, e o chip teria
// prometido "as mais ricas" entregando outra coisa.
const SORT_FIELDS: BoardSortField[] = [
  'xp_week',
  'avg_xp_per_active',
  'missions_week',
  'active_members',
  'treasury',
];

const LABEL_KEY: Record<BoardSortField, string> = {
  xp_week: 'legions.board.sortXpWeek',
  avg_xp_per_active: 'legions.board.sortAvgXp',
  missions_week: 'legions.board.sortMissions',
  active_members: 'legions.board.sortActive',
  total_members: 'legions.board.sortTotal',
  treasury: 'legions.board.sortTreasury',
};

export default function BoardSortChips({ value, color, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
      {SORT_FIELDS.map((field) => {
        const active = field === value;
        return (
          <TouchableOpacity
            key={field}
            onPress={() => onChange(field)}
            disabled={active}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className="rounded-full px-3 py-1.5 border"
            style={{
              backgroundColor: active ? color : 'transparent',
              borderColor: active ? color : '#e0dada',
            }}>
            <Text
              className="text-[11.5px] font-bold"
              style={{ color: active ? '#fff' : '#8a7a7a' }}>
              {t(LABEL_KEY[field])}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
