import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LogoIcon } from '../../../components';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish, opacity, scale]);

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <StatusBar style="light" />
      <Animated.View style={{ opacity, transform: [{ scale }] }} className="items-center">
        <LogoIcon size={72} color="#fff" />
      </Animated.View>
    </View>
  );
}
