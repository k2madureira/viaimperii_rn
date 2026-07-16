import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CoinAmount } from '../../../../components/icons';

interface Props {
  visible: boolean;
  xp: number;
  coins?: number;
  onDone: () => void;
}

const COLORS = ['#D4AF37', '#9E1B32', '#2F7A52', '#E8C36B', '#6B1221'];
const DURATION = 1600;
const HOLD = 2000; // tempo total antes de desmontar

/**
 * Overlay de celebração ao creditar XP de uma missão (F3): confete + "+XP" que
 * pulsa. Renderizado como camada absoluta com pointerEvents="none" (não bloqueia
 * toques) e auto-desmonta. Sem dependências extras — usa Animated do core.
 */
export default function MissionCelebration({ visible, xp, coins, onDone }: Props) {
  const { t } = useTranslation();
  const anim = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;

  // Partículas geradas uma vez (posição/cor/queda aleatórias).
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        left: Math.random() * 100,
        size: 6 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
        fall: 220 + Math.random() * 260,
        drift: (Math.random() - 0.5) * 90,
        spin: Math.random() * 3 + 1,
      })),
    [],
  );

  useEffect(() => {
    if (!visible) return;
    anim.setValue(0);
    pop.setValue(0);
    Animated.parallel([
      Animated.timing(anim, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
    ]).start();
    const id = setTimeout(onDone, HOLD);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const badgeScale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const badgeOpacity = anim.interpolate({
    inputRange: [0, 0.08, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
      {particles.map((p, i) => {
        const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-30, p.fall] });
        const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] });
        const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 * p.spin}deg`] });
        const opacity = anim.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              top: '30%',
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 1.4,
              borderRadius: 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}

      <Animated.View
        style={{
          opacity: badgeOpacity,
          transform: [{ scale: badgeScale }],
          backgroundColor: '#fff',
          borderRadius: 20,
          paddingHorizontal: 26,
          paddingVertical: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        }}>
        <Text style={{ fontSize: 30 }}>🎉</Text>
        <Text className="text-[22px] font-extrabold text-accent-500 mt-1">
          +{xp} {t('common.xp')}
        </Text>
        {coins && coins > 0 ? (
          <View className="mt-1">
            <CoinAmount atomic={coins} size={13} textColor="#9a7b1f" />
          </View>
        ) : null}
        <Text className="text-[12px] font-bold text-laurel mt-1">
          {t('missionItem.toastCompletedTitle')}
        </Text>
      </Animated.View>
    </View>
  );
}
