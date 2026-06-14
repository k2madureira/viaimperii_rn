import React from 'react';
import { Text, View } from 'react-native';
import { SPECIALTIES, SPECIALTY_LABELS_PT } from '../../../constants/game';
import SpecialtyIcon from './SpecialtyIcon';

interface Props {
  mastery: Record<string, number>;
  mainSpecialty: string | null;
  rankLevel: number;
}

export default function MasterySection({ mastery, mainSpecialty, rankLevel }: Props) {
  return (
    <View>
      <Text className="text-[15px] font-extrabold text-[#111] mb-3">Maestrias</Text>

      <View className="bg-white border border-[#f0eded] rounded-[14px] p-4 gap-3">
        {SPECIALTIES.map((spec) => {
          const points = mastery[spec] ?? 0;
          // 100% = pontos atuais + (nível da patente × 10)
          const ceiling = points + rankLevel * 10;
          const progress = ceiling > 0 ? Math.min(1, points / ceiling) : 0;
          const isMain = spec === mainSpecialty;

          return (
            <View key={spec}>
              <View className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center">
                  <View className="mr-1.5">
                    <SpecialtyIcon specialty={spec} size={15} />
                  </View>
                  <Text className="text-[13px] font-semibold text-[#333]">
                    {SPECIALTY_LABELS_PT[spec]}
                  </Text>
                  {isMain && (
                    <View className="ml-2 px-1.5 py-0.5 bg-[#f4eaea] rounded">
                      <Text className="text-[9px] font-bold text-primary tracking-[0.5px]">
                        PRINCIPAL
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-[12px] text-[#999]">
                  {points}/{ceiling} · {Math.round(progress * 100)}%
                </Text>
              </View>
              <View className="h-[5px] bg-[#f0eded] rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress * 100}%` }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
