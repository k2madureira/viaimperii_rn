import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { Legion } from '../../../../../api/legions/legionsApi';

interface Props {
  legion: Legion;
  color: string;
  active: boolean;
  isUserLegion: boolean;
  onPress: () => void;
}

// Brasão circular da legião na fileira horizontal de seleção.
export default function LegionBadge({ legion, color, active, isUserLegion, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} className="items-center" style={{ width: 64 }}>
      <View
        className="w-[56px] h-[56px] rounded-full items-center justify-center overflow-hidden"
        style={{
          backgroundColor: active ? color : '#f5f2f2',
          borderWidth: isUserLegion ? 2.5 : active ? 2 : 0,
          borderColor: isUserLegion ? '#2F7A52' : color,
        }}>
        {legion.thumb_url ?? legion.image_url ? (
          <Image
            source={{ uri: (legion.thumb_url ?? legion.image_url) as string }}
            style={{ width: 40, height: 40, tintColor: active ? '#fff' : color }}
            resizeMode="contain"
          />
        ) : (
          <Text className="text-[22px]">🦅</Text>
        )}
      </View>
      <Text
        numberOfLines={1}
        className="text-[10px] mt-1 text-center font-semibold"
        style={{ color: active ? color : '#888' }}>
        {legion.name.split(' ').pop()}
      </Text>
    </TouchableOpacity>
  );
}
