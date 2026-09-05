import React, { useEffect, useMemo, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../../components/text';
import { ChestSlot, ChestSlotOption } from '../../../../../../api/chests';

interface Props {
  slot: ChestSlot;
  // reward_ref atualmente selecionado neste slot.
  selectedRef: string | null;
  onSelect: (rewardRef: string) => void;
}

// Nome da(s) profissão(ões) que a missão ativa (o slot de missão é, na prática,
// um seletor de PROFISSÃO — escolher a missão ativa a profissão inteira dela).
function professionLabel(option: ChestSlotOption): string {
  const names = option.professions?.map((p) => p.name).filter(Boolean) ?? [];
  return names.length ? names.join(' + ') : (option.mission?.name ?? '');
}

/**
 * Seletor de UMA recompensa de um slot do baú (§35). Reusa o padrão do
 * LegionSelectModal: carrossel com setas ‹ ›, preview central, indicadores (dots)
 * e — auxílios permitidos (§0.1) — filtro de raridade (avatares) e **grid de
 * seleção** (avatares E profissões, como no mercado/seletor de avatar). A opção
 * centralizada É a seleção do slot; tocar num item do grid centraliza/seleciona.
 */
export default function SlotSelector({ slot, selectedRef, onSelect }: Props) {
  const { t } = useTranslation();
  const isAvatar = slot.reward_kind === 'cosmetic_asset';

  // Filtro de raridade (só faz sentido para avatares).
  const rarities = useMemo(() => {
    if (!isAvatar) return [];
    const set = new Set<string>();
    slot.options.forEach((o) => o.asset && set.add(o.asset.rarity));
    return Array.from(set);
  }, [slot.options, isAvatar]);

  const [rarityFilter, setRarityFilter] = useState<string | null>(null);

  const options = useMemo(() => {
    if (!rarityFilter) return slot.options;
    return slot.options.filter((o) => o.asset?.rarity === rarityFilter);
  }, [slot.options, rarityFilter]);

  const [index, setIndex] = useState(0);

  // Reseta o índice quando o filtro muda a lista.
  useEffect(() => {
    setIndex(0);
  }, [rarityFilter]);

  // A opção centralizada vira a seleção do slot.
  const current: ChestSlotOption | undefined = options[index];
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
  const slotLabel = isAvatar ? t('chests.slotAvatar') : t('chests.slotProfession');

  return (
    <View className="bg-white rounded-[16px] p-5 border border-[#eee]">
      <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase text-center">
        {slotLabel}
      </Text>
      <Text className="text-[13px] text-[#888] text-center mt-1">{t('chests.chooseForSlot')}</Text>

      {/* Filtro de raridade (avatares) */}
      {isAvatar && rarities.length > 1 ? (
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
          {isAvatar ? (
            <View className="w-28 h-28 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden">
              {current.asset ? (
                <Image
                  source={{ uri: current.asset.thumb_url ?? current.asset.url }}
                  style={{ width: 100, height: 100 }}
                  resizeMode="contain"
                />
              ) : null}
            </View>
          ) : (
            // Missão = escolha de PROFISSÃO: profissão em destaque, missão como origem.
            <View className="w-full items-center">
              <Text className="text-[17px] font-extrabold text-[#111] text-center" numberOfLines={2}>
                {professionLabel(current)}
              </Text>
              {current.mission ? (
                <>
                  <Text className="text-[11px] text-[#999] text-center mt-1" numberOfLines={1}>
                    {current.mission.name}
                  </Text>
                  <View className="flex-row gap-1.5 mt-1.5">
                    <View className="bg-[#f2f2f2] rounded-full px-2 py-0.5">
                      <Text className="text-[10px] font-semibold text-[#777] capitalize">
                        {current.mission.difficulty}
                      </Text>
                    </View>
                    <View className="bg-[#f2f2f2] rounded-full px-2 py-0.5">
                      <Text className="text-[10px] font-semibold text-[#777] capitalize">
                        {current.mission.type}
                      </Text>
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => go(1)}
          disabled={total < 2}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className={`w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea] ${total < 2 ? 'opacity-30' : ''}`}>
          <Text className="text-[22px] text-primary-500 leading-none">›</Text>
        </TouchableOpacity>
      </View>

      {/* Nome/raridade (avatar) ou nota de ativação (profissão) */}
      {isAvatar && current.asset ? (
        <View className="items-center mt-3">
          <Text className="text-[15px] font-bold text-[#111]">{current.asset.name}</Text>
          <Text className="text-[11px] text-[#9a7b1f] font-semibold capitalize mt-0.5">
            {current.asset.rarity}
          </Text>
        </View>
      ) : null}
      {!isAvatar ? (
        <Text className="text-[11px] text-[#8B1A2B] text-center mt-3 leading-[16px]">
          {t('chests.missionActivatesProfession')}
        </Text>
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

      {/* Grid de seleção — auxílio (§0.1): clicar seleciona. Avatares = miniaturas;
          profissões = cards com o nome da profissão (como no mercado). */}
      {total > 1 ? (
        isAvatar ? (
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
        ) : (
          <View className="flex-row flex-wrap justify-center gap-2 mt-4">
            {options.map((o, i) => (
              <TouchableOpacity
                key={o.reward_ref}
                onPress={() => setIndex(i)}
                className={`rounded-[10px] px-3 py-2 border-2 ${
                  i === index ? 'border-primary-500 bg-[#f6f1e7]' : 'border-[#eee] bg-white'
                }`}>
                <Text
                  className={`text-[12px] font-semibold ${i === index ? 'text-[#8B1A2B]' : 'text-[#555]'}`}
                  numberOfLines={1}>
                  {professionLabel(o)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )
      ) : null}
    </View>
  );
}
