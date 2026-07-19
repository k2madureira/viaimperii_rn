import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Legion } from '../../../../../api/legion/dto';
import { legionColorByIndex } from '../../../../../utils/legionColors';
import LegionBadge from '../../cards/legionBadge';
import LegionExpandedCard from '../../cards/legionExpandedCard';

interface Props {
  legions: Legion[];
  userLegionId: number | null;
  userHasLegion: boolean;
  totalXp: number;
  userId: string | undefined;
}

// Fileira de brasões + card expandido da legião selecionada.
export default function LegionBadges({
  legions,
  userLegionId,
  userHasLegion,
  totalXp,
  userId,
}: Props) {
  const [selectedId, setSelectedId] = useState<number>(legions[0]?.id ?? 0);
  const selected = legions.find((l) => l.id === selectedId) ?? legions[0];
  const selectedIndex = legions.findIndex((l) => l.id === selectedId);

  return (
    <View className="gap-4">
      {/* Badge row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
        {legions.map((legion, i) => (
          <LegionBadge
            key={legion.id}
            legion={legion}
            color={legionColorByIndex(i)}
            active={legion.id === selectedId}
            isUserLegion={legion.id === userLegionId}
            onPress={() => setSelectedId(legion.id)}
          />
        ))}
      </ScrollView>

      {/* Expanded card */}
      {selected && (
        <LegionExpandedCard
          legion={selected}
          color={legionColorByIndex(selectedIndex)}
          isUserLegion={selected.id === userLegionId}
          userHasLegion={userHasLegion}
          totalXp={totalXp}
          userId={userId}
        />
      )}
    </View>
  );
}
