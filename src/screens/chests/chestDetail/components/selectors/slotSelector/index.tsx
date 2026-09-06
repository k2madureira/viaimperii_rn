import React, { useEffect, useMemo, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../../components/text';
import { viaimperiiApi } from '../../../../../../api';
import { ChestSlot, ChestSlotOption } from '../../../../../../api/chests';
import ProfessionSlot from '../professionSlot';

interface Props {
  slot: ChestSlot;
  // reward_ref atualmente selecionado neste slot.
  selectedRef: string | null;
  onSelect: (rewardRef: string) => void;
}

/**
 * Seletor de UMA recompensa de um slot do baú (§35). Despacha por tipo:
 * - `cosmetic_asset` → avatar (carrossel + filtro de raridade + grid de miniaturas);
 * - `profession_mission` → profissão (card estilo mercado; ver `ProfessionSlot`).
 * Reusa o padrão do LegionSelectModal (§0.1): setas ‹ ›, preview central, dots.
 * A opção centralizada É a seleção do slot.
 */
export default function SlotSelector({ slot, selectedRef, onSelect }: Props) {
  if (slot.reward_kind !== 'cosmetic_asset') {
    return <ProfessionSlot slot={slot} selectedRef={selectedRef} onSelect={onSelect} />;
  }

  return <AvatarSlot slot={slot} onSelect={onSelect} />;
}

// --- Slot de avatar ---
function AvatarSlot({ slot, onSelect }: { slot: ChestSlot; onSelect: (r: string) => void }) {
  const { t } = useTranslation();

  // Avatares que o usuário JÁ possui → escondidos do baú (não faz sentido ganhar de novo).
  const { data: ownedAssets } = useQuery({
    queryKey: ['owned-assets', 'avatar'],
    queryFn: () => viaimperiiApi.assets.owned('avatar'),
  });
  const ownedIds = useMemo(
    () => new Set((ownedAssets ?? []).map((a) => a.id)),
    [ownedAssets],
  );

  // Opções disponíveis = todas menos as já possuídas. Fallback: se filtrar tudo
  // (o usuário já tem todas), mostra todas — melhor que slot vazio.
  const available = useMemo(() => {
    const notOwned = slot.options.filter((o) => o.asset && !ownedIds.has(o.asset.id));
    return notOwned.length > 0 ? notOwned : slot.options;
  }, [slot.options, ownedIds]);

  const rarities = useMemo(() => {
    const set = new Set<string>();
    available.forEach((o) => o.asset && set.add(o.asset.rarity));
    return Array.from(set);
  }, [available]);

  const [rarityFilter, setRarityFilter] = useState<string | null>(null);

  const options = useMemo(() => {
    if (!rarityFilter) return available;
    return available.filter((o) => o.asset?.rarity === rarityFilter);
  }, [available, rarityFilter]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [rarityFilter]);

  // A lista pode encolher quando `owned` chega → mantém o índice válido.
  useEffect(() => {
    setIndex((i) => (i >= options.length ? 0 : i));
  }, [options.length]);

  const current: ChestSlotOption | undefined = options[Math.min(index, options.length - 1)];
  useEffect(() => {
    if (current) onSelect(current.reward_ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.reward_ref]);

  if (options.length === 0 || !current) {
    return (
      <View className="bg-white rounded-[16px] p-5 border border-[#eee]">
        <Text className="text-[13px] text-[#999] text-center">{t('chests.chooseForSlot')}</Text>
      </View>
    );
  }

  const total = options.length;
  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + total) % total);

  return (
    <View className="bg-white rounded-[16px] p-5 border border-[#eee]">
      <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase text-center">
        {t('chests.slotAvatar')}
      </Text>
      <Text className="text-[13px] text-[#888] text-center mt-1">{t('chests.chooseForSlot')}</Text>

      {/* Filtro de raridade */}
      {rarities.length > 1 ? (
        <View className="flex-row flex-wrap justify-center gap-1.5 mt-3">
          <TouchableOpacity
            onPress={() => setRarityFilter(null)}
            className={`rounded-full px-3 py-1 ${!rarityFilter ? 'bg-primary-500' : 'bg-[#f2f2f2]'}`}>
            <Text className={`text-[11px] font-semibold ${!rarityFilter ? 'text-white' : 'text-[#777]'}`}>
              {t('chests.rarityFilterAll')}
            </Text>
          </TouchableOpacity>
          {rarities.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRarityFilter(r)}
              className={`rounded-full px-3 py-1 ${rarityFilter === r ? 'bg-primary-500' : 'bg-[#f2f2f2]'}`}>
              <Text
                className={`text-[11px] font-semibold capitalize ${rarityFilter === r ? 'text-white' : 'text-[#777]'}`}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* Carrossel: setas + preview central */}
      <View className="flex-row items-center justify-between w-full mt-4">
        <TouchableOpacity
          onPress={() => go(-1)}
          disabled={total < 2}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className={`w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea] ${total < 2 ? 'opacity-30' : ''}`}>
          <Text className="text-[22px] text-primary-500 leading-none">‹</Text>
        </TouchableOpacity>

        <View className="flex-1 items-center px-2">
          <View className="w-28 h-28 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden">
            {current.asset ? (
              <Image
                source={{ uri: current.asset.thumb_url ?? current.asset.url }}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => go(1)}
          disabled={total < 2}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className={`w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea] ${total < 2 ? 'opacity-30' : ''}`}>
          <Text className="text-[22px] text-primary-500 leading-none">›</Text>
        </TouchableOpacity>
      </View>

      {/* Nome + raridade */}
      {current.asset ? (
        <View className="items-center mt-3">
          <Text className="text-[15px] font-bold text-[#111]">{current.asset.name}</Text>
          <Text className="text-[11px] text-[#9a7b1f] font-semibold capitalize mt-0.5">
            {current.asset.rarity}
          </Text>
        </View>
      ) : null}

      {/* Indicadores de posição */}
      {total > 1 ? (
        <View className="flex-row justify-center flex-wrap gap-1.5 mt-4">
          {options.map((o, i) => (
            <View
              key={o.reward_ref}
              className={`h-1.5 rounded-full ${i === index ? 'w-4 bg-primary-500' : 'w-1.5 bg-[#e0dada]'}`}
            />
          ))}
        </View>
      ) : null}

      {/* Grid de miniaturas — clicar seleciona */}
      {total > 1 ? (
        <View className="flex-row flex-wrap justify-center gap-2 mt-4">
          {options.map((o, i) => (
            <TouchableOpacity
              key={o.reward_ref}
              onPress={() => setIndex(i)}
              className={`w-12 h-12 rounded-[10px] items-center justify-center overflow-hidden border-2 ${
                i === index ? 'border-primary-500' : 'border-[#eee]'
              }`}>
              {o.asset ? (
                <Image
                  source={{ uri: o.asset.thumb_url ?? o.asset.url }}
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}
