import React, { useEffect, useMemo, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Rect } from 'react-native-svg';
import Text from '../../../../../../components/text';
import { viaimperiiApi } from '../../../../../../api';
import { ChestSlot } from '../../../../../../api/chests';
import { Profession } from '../../../../../../api/professions';

interface Props {
  slot: ChestSlot;
  selectedRef: string | null;
  onSelect: (rewardRef: string) => void;
}

// Ícone genérico (livro/pasta) quando a profissão não tem icon_url — igual ao mercado.
function ProfessionGlyph({ size = 64, color = '#9E1B32' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={7} width={18} height={13} rx={2} stroke={color} strokeWidth={1.6} />
      <Path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M3 12h18" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

interface ProfessionEntry {
  id: number;
  slug: string;
  name: string;
  rewardRef: string; // missão (aleatória) que ativa esta profissão
}

/**
 * Seletor de PROFISSÃO do baú (§35). O slot de missão é, na prática, uma escolha
 * de profissão: abrir a missão ativa a profissão INTEIRA dela. Então mostramos
 * **um card por profissão** (imagem do livro + título + descrição, como no
 * mercado), escolhendo **uma missão aleatória** por profissão como `reward_ref`.
 * Reusa o padrão de carrossel do LegionSelectModal (setas ‹ ›, dots, grid).
 */
export default function ProfessionSlot({ slot, selectedRef, onSelect }: Props) {
  const { t } = useTranslation();

  // Catálogo completo (mesma queryKey do mercado → dedup) para pegar imagem/descrição.
  const { data: catalog } = useQuery({
    queryKey: ['professions'],
    queryFn: () => viaimperiiApi.professions.catalog({ perPage: 100 }),
  });

  // Uma profissão por card; para cada uma, escolhe uma missão (reward_ref) aleatória
  // entre as opções que a ativam. Estável enquanto as opções não mudam.
  const entries = useMemo<ProfessionEntry[]>(() => {
    const map = new Map<number, { id: number; slug: string; name: string; refs: string[] }>();
    for (const o of slot.options) {
      for (const p of o.professions ?? []) {
        const cur = map.get(p.id) ?? { id: p.id, slug: p.slug, name: p.name, refs: [] };
        cur.refs.push(o.reward_ref);
        map.set(p.id, cur);
      }
    }
    return Array.from(map.values()).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      rewardRef: p.refs[Math.floor(Math.random() * p.refs.length)],
    }));
  }, [slot.options]);

  const [index, setIndex] = useState(0);
  const current = entries[index];

  useEffect(() => {
    if (current) onSelect(current.rewardRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.rewardRef]);

  if (entries.length === 0 || !current) {
    return (
      <View className="bg-white rounded-[16px] p-5 border border-[#eee]">
        <Text className="text-[13px] text-[#999] text-center">{t('chests.chooseForSlot')}</Text>
      </View>
    );
  }

  const total = entries.length;
  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + total) % total);

  // Profissão completa (imagem/descrição/especialidade) do catálogo, casada por id/slug.
  const full: Profession | undefined = catalog?.find(
    (c) => c.id === current.id || c.slug === current.slug,
  );
  const specColor = full?.specialty_color ?? '#5B6B7A';

  return (
    <View className="bg-white rounded-[16px] p-5 border border-[#eee]">
      <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase text-center">
        {t('chests.slotProfession')}
      </Text>
      <Text className="text-[13px] text-[#888] text-center mt-1">{t('chests.chooseForSlot')}</Text>

      {/* Carrossel: setas + card central (livro + título + descrição) */}
      <View className="flex-row items-center justify-between w-full mt-4">
        <TouchableOpacity
          onPress={() => go(-1)}
          disabled={total < 2}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className={`w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea] ${total < 2 ? 'opacity-30' : ''}`}>
          <Text className="text-[22px] text-primary-500 leading-none">‹</Text>
        </TouchableOpacity>

        <View className="flex-1 items-center px-2">
          {/* Imagem do livro da profissão */}
          <View className="w-28 h-28 items-center justify-center">
            {full?.icon_url ? (
              <Image
                source={{ uri: full.icon_url }}
                style={{ width: 112, height: 112 }}
                resizeMode="contain"
              />
            ) : (
              <ProfessionGlyph size={64} />
            )}
          </View>

          {/* Título da profissão */}
          <Text className="text-[17px] font-extrabold text-[#111] text-center mt-2" numberOfLines={2}>
            {full?.name ?? current.name}
          </Text>

          {/* Especialidade + nº de missões (quando o catálogo resolve) */}
          {full ? (
            <View className="flex-row items-center gap-1.5 mt-1 flex-wrap justify-center">
              <Text className="text-[12px] font-semibold text-primary-500">
                {t('market.professions.missionCount', { n: full.mission_count })}
              </Text>
              {full.specialty_name ? (
                <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${specColor}1A` }}>
                  <Text className="text-[11px] font-bold" numberOfLines={1} style={{ color: specColor }}>
                    {full.specialty_name}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => go(1)}
          disabled={total < 2}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className={`w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea] ${total < 2 ? 'opacity-30' : ''}`}>
          <Text className="text-[22px] text-primary-500 leading-none">›</Text>
        </TouchableOpacity>
      </View>

      {/* Descrição da profissão */}
      {full?.description ? (
        <Text className="text-[12px] text-[#999] leading-[17px] text-center mt-3" numberOfLines={4}>
          {full.description}
        </Text>
      ) : null}

      {/* Nota: abrir ativa a profissão inteira */}
      <Text className="text-[11px] text-[#8B1A2B] text-center mt-3 leading-[16px]">
        {t('chests.missionActivatesProfession')}
      </Text>

      {/* Indicadores de posição */}
      {total > 1 ? (
        <View className="flex-row justify-center flex-wrap gap-1.5 mt-4">
          {entries.map((e, i) => (
            <View
              key={e.id}
              className={`h-1.5 rounded-full ${i === index ? 'w-4 bg-primary-500' : 'w-1.5 bg-[#e0dada]'}`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
