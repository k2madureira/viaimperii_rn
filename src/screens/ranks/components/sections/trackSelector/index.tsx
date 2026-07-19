import React from 'react';
import { View } from 'react-native';
import { Track } from '../../../../../api/ranks/ranksApi';
import TrackTab from '../../buttons/trackTab';

interface Props {
  tracks: Track[];
  value: number | null;
  onChange: (trackId: number) => void;
}

// Seleção de trilha. Some quando o catálogo de trilhas ainda não carregou.
export default function TrackSelector({ tracks, value, onChange }: Props) {
  if (tracks.length === 0) return null;
  return (
    <View className="flex-row bg-[#f0eded] rounded-[12px] p-1">
      {tracks.map((tr) => (
        <TrackTab
          key={tr.id}
          label={tr.name}
          active={tr.id === value}
          onPress={() => onChange(tr.id)}
        />
      ))}
    </View>
  );
}
