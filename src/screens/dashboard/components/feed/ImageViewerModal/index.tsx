import React, { useEffect } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  uri: string | null;
  onClose: () => void;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const IMG_H = SCREEN_H * 0.8;
const MAX_SCALE = 5;

// Visualizador de imagem em tela cheia, 100% in-app: pinça p/ zoom, arrastar
// quando ampliada, duplo-toque p/ alternar zoom e toque simples p/ fechar.
export default function ImageViewerModal({ uri, onClose }: Props) {
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  // Zera o estado sempre que uma nova imagem é aberta.
  useEffect(() => {
    if (uri != null) {
      scale.value = 1;
      savedScale.value = 1;
      tx.value = 0;
      ty.value = 0;
      savedTx.value = 0;
      savedTy.value = 0;
    }
  }, [uri, scale, savedScale, tx, ty, savedTx, savedTy]);

  const clampTranslation = (s: number) => {
    'worklet';
    const maxX = (SCREEN_W * (s - 1)) / 2;
    const maxY = (IMG_H * (s - 1)) / 2;
    tx.value = Math.min(Math.max(tx.value, -maxX), maxX);
    ty.value = Math.min(Math.max(ty.value, -maxY), maxY);
  };

  const resetZoom = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    tx.value = withTiming(0);
    ty.value = withTiming(0);
    savedTx.value = 0;
    savedTy.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 1), MAX_SCALE);
      clampTranslation(scale.value);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) resetZoom();
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        tx.value = savedTx.value + e.translationX;
        ty.value = savedTy.value + e.translationY;
        clampTranslation(scale.value);
      }
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        resetZoom();
      } else {
        scale.value = withTiming(2);
        savedScale.value = 2;
      }
    });

  // Toque simples fecha — mas só depois que o duplo-toque falhar.
  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      runOnJS(onClose)();
    });

  const composed = Gesture.Exclusive(
    Gesture.Simultaneous(pinch, pan),
    doubleTap,
    singleTap,
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Modal
      transparent
      visible={uri != null}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        {/* Fundo: toque nas margens (fora da imagem) também fecha */}
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />

        {uri ? (
          <GestureDetector gesture={composed}>
            <Animated.Image
              source={{ uri }}
              style={[{ width: SCREEN_W, height: IMG_H }, animStyle]}
              resizeMode="contain"
            />
          </GestureDetector>
        ) : null}

        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          style={{ position: 'absolute', top: insets.top + 8, right: 16 }}
          className="w-10 h-10 rounded-full bg-white/15 items-center justify-center">
          <Text className="text-[20px] text-white">✕</Text>
        </TouchableOpacity>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.97)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
