import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SPECIALTIES, SPECIALTY_MEDALS } from '../../../constants/game';

function MedalIcon({ earned }: { earned: boolean }) {
  const color = earned ? '#8B1A2B' : '#d8d2d2';
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={9} r={6} stroke={color} strokeWidth={1.8} fill={earned ? '#f4eaea' : 'none'} />
      <Path d="M8 13L6 22L12 19L18 22L16 13" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.5 9L11 10.5L14 7.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

interface Props {
  medals: string[];
}

export default function MedalsSection({ medals }: Props) {
  const earnedCount = medals.length;

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-[15px] font-extrabold text-[#111]">Medalhas</Text>
        <Text className="text-[12px] text-[#999]">
          {earnedCount}/{SPECIALTIES.length}
        </Text>
      </View>

      <View className="bg-white border border-[#f0eded] rounded-[14px] p-4 gap-3">
        {SPECIALTIES.map((spec) => {
          const medalName = SPECIALTY_MEDALS[spec];
          const earned = medals.includes(medalName);
          return (
            <View key={spec} className="flex-row items-center">
              <MedalIcon earned={earned} />
              <View className="ml-3 flex-1">
                <Text className={`text-[13px] font-semibold ${earned ? 'text-[#111]' : 'text-[#bbb]'}`}>
                  {medalName}
                </Text>
                <Text className="text-[11px] text-[#aaa]">{spec}</Text>
              </View>
              {earned && (
                <Text className="text-[11px] font-bold text-primary">Conquistada</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
