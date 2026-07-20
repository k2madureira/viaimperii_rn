import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Text from '../../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Profession } from '../../../../../../api/professions';
import { CarouselCard, PROF_CARD_WIDTH } from '../..';

interface Props {
  professions: Profession[];
  currentId: number;
  onSelect: (id: number) => void;
}

// ── Seleção de profissão (carrossel circular quando há mais de uma) ───────
// 3+ cópias da lista simulam scroll infinito; ao assentar, o card central vira
// o ativo e reposicionamos silenciosamente na cópia do meio. Tudo imperativo
// (nada de useEffect reagindo à seleção) p/ não travar.
export default function ProfessionCarousel({ professions, currentId, onSelect }: Props) {
  const { t } = useTranslation();

  const CARD_GAP = 14;
  const CARD_STEP = PROF_CARD_WIDTH + CARD_GAP;
  const N = professions.length;
  const isCircular = N > 1;
  // Nº ímpar de cópias (mais para listas curtas) — dá folga para flings fortes
  // antes de recentralizar na cópia do meio.
  const COPIES = N <= 2 ? 7 : N <= 4 ? 5 : 3;
  const MIDDLE = Math.floor(COPIES / 2);
  const carouselData = isCircular
    ? Array.from({ length: COPIES }, () => professions).flat()
    : professions;
  const carouselRef = useRef<ScrollView>(null);
  const [carouselW, setCarouselW] = useState(0);
  const didInit = useRef(false);
  // Ignora o próximo "settle" quando ele foi causado pela recentralização silenciosa
  // (evita trocar o ativo sozinho durante o scroll).
  const suppressSettle = useRef(false);

  const scrollToDataIndex = (dataIndex: number, animated: boolean) => {
    carouselRef.current?.scrollTo({ x: dataIndex * CARD_STEP, animated });
  };

  // Posiciona uma vez na cópia do meio, no card selecionado (após o layout).
  useEffect(() => {
    if (didInit.current || carouselW === 0 || !isCircular) return;
    const selIdx = Math.max(0, professions.findIndex((p) => p.id === currentId));
    const id = setTimeout(() => {
      scrollToDataIndex(MIDDLE * N + selIdx, false);
      didInit.current = true;
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselW, isCircular, N]);

  // Ao assentar (fim do snap/inércia): define o card central como ativo e recentraliza
  // na cópia do meio se chegou perto das bordas (efeito infinito, sem emenda).
  const onCarouselSettle = (offsetX: number) => {
    if (!isCircular) return;
    // O settle disparado pela recentralização silenciosa não deve trocar o ativo.
    if (suppressSettle.current) {
      suppressSettle.current = false;
      return;
    }
    const raw = Math.round(offsetX / CARD_STEP);
    const realIdx = ((raw % N) + N) % N;
    const p = professions[realIdx];
    if (p && p.id !== currentId) onSelect(p.id);
    if (raw < N || raw >= (COPIES - 1) * N) {
      suppressSettle.current = true;
      scrollToDataIndex(MIDDLE * N + realIdx, false);
    }
  };

  if (N <= 1) return null;

  return (
    <View className="gap-2.5">
      <Text className="text-[10px] font-bold text-[#b0a0a0] tracking-[2px] uppercase px-0.5">
        {t('professionMissions.switchTitle')}
      </Text>
      <ScrollView
        ref={carouselRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_STEP}
        snapToAlignment="center"
        onLayout={(e) => setCarouselW(e.nativeEvent.layout.width)}
        onMomentumScrollEnd={(e) => onCarouselSettle(e.nativeEvent.contentOffset.x)}
        contentContainerStyle={{
          paddingTop: 50,
          paddingBottom: 8,
          gap: CARD_GAP,
          paddingHorizontal: carouselW > 0 ? Math.max(4, (carouselW - PROF_CARD_WIDTH) / 2) : 4,
        }}>
        {carouselData.map((p, i) => (
          <CarouselCard
            key={`${i}-${p.id}`}
            profession={p}
            selected={p.id === currentId}
            onPress={() => {
              if (p.id !== currentId) onSelect(p.id);
              // Sempre centraliza o card escolhido.
              scrollToDataIndex(i, true);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}
