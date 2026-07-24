import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Profession } from '../../../../../../api/professions';
import ProfessionCard from '../professionCard';

// Card do carrossel com animação de foco: selecionado cresce (escala 1) e fica
// opaco; não selecionado reduz (escala 0.8) e esmaece.
interface Props {
  profession: Profession;
  selected: boolean;
  onPress: () => void;
}

export default function CarouselCard({ profession, selected, onPress }: Props) {
  const scale = useRef(new Animated.Value(selected ? 1 : 0.8)).current;
  const opacity = useRef(new Animated.Value(selected ? 1 : 0.55)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: selected ? 1 : 0.8, friction: 7, tension: 70, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: selected ? 1 : 0.55, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [selected, scale, opacity]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <ProfessionCard profession={profession} selected={selected} onPress={onPress} />
    </Animated.View>
  );
}
