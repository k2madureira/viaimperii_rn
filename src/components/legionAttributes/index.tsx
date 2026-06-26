import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { parseLegionDescription } from '../../utils/legionDescription';

interface Props {
  description: string | null;
  // 'boxes' (modal): dois boxes lado a lado. 'rows': cada atributo em uma linha.
  variant?: 'boxes' | 'rows';
}

// Renderiza a descrição da legião: um texto de introdução + Perfil / Missões.
export default function LegionAttributes({ description, variant = 'boxes' }: Props) {
  const { t } = useTranslation();
  const { intro, perfil, missoes } = parseLegionDescription(description);

  if (!intro && perfil.length === 0 && missoes.length === 0) return null;

  return (
    <View className="w-full items-center mt-3">
      {intro ? (
        <Text className="text-[13px] text-[#666] leading-[19px] text-center">{intro}</Text>
      ) : null}

      {(perfil.length > 0 || missoes.length > 0) &&
        (variant === 'rows' ? (
          <View className="w-full mt-3 gap-2.5">
            {perfil.length > 0 && (
              <TagRow label={t('legionAttributes.profile')} items={perfil} color="#8B1A2B" bg="bg-primary/10" />
            )}
            {missoes.length > 0 && (
              <TagRow label={t('legionAttributes.missions')} items={missoes} color="#9a7b1f" bg="bg-gold/20" />
            )}
          </View>
        ) : (
          <View className="flex-row gap-2.5 w-full mt-3">
            {perfil.length > 0 && (
              <TagBox label={t('legionAttributes.profile')} items={perfil} color="#8B1A2B" bg="bg-primary/10" />
            )}
            {missoes.length > 0 && (
              <TagBox label={t('legionAttributes.missions')} items={missoes} color="#9a7b1f" bg="bg-gold/20" />
            )}
          </View>
        ))}
    </View>
  );
}

// Layout em linha: nome do atributo à esquerda, chips à direita.
function TagRow({
  label,
  items,
  color,
  bg,
}: {
  label: string;
  items: string[];
  color: string;
  bg: string;
}) {
  return (
    <View className="flex-row items-start border border-[#f0eded] rounded-[14px] p-3">
      <View className="w-[68px] pt-0.5">
        <Text className="text-[11px] font-bold tracking-[1px] uppercase" style={{ color }}>
          {label}
        </Text>
      </View>
      <View className="flex-1 flex-row flex-wrap gap-1.5">
        {items.map((item) => (
          <View key={item} className={`${bg} rounded-full px-2.5 py-1`}>
            <Text className="text-[11px] font-semibold" style={{ color }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function TagBox({
  label,
  items,
  color,
  bg,
}: {
  label: string;
  items: string[];
  color: string;
  bg: string;
}) {
  return (
    <View className="flex-1 border border-[#f0eded] rounded-[14px] p-3">
      <Text className="text-[11px] font-bold tracking-[1px] uppercase text-center" style={{ color }}>
        {label}
      </Text>
      <View className="flex-row flex-wrap justify-center gap-1.5 mt-2">
        {items.map((item) => (
          <View key={item} className={`${bg} rounded-full px-2.5 py-1`}>
            <Text className="text-[11px] font-semibold" style={{ color }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
