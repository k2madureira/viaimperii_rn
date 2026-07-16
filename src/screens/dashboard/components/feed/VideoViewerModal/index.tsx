import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  uri: string | null;
  onClose: () => void;
}

// Player de vídeo em tela cheia, in-app (expo-video). Controles nativos, autoplay
// ao abrir; pausa/solta o recurso ao fechar.
export default function VideoViewerModal({ uri, onClose }: Props) {
  const insets = useSafeAreaInsets();

  const player = useVideoPlayer(uri ?? '', (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (uri) {
      player.currentTime = 0;
      player.play();
    } else {
      player.pause();
    }
  }, [uri, player]);

  return (
    <Modal
      transparent
      visible={uri != null}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />

        {uri ? (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            allowsFullscreen
            nativeControls
          />
        ) : null}

        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          style={{ position: 'absolute', top: insets.top + 8, right: 16 }}
          className="w-10 h-10 rounded-full bg-white/15 items-center justify-center">
          <Text className="text-[20px] text-white">✕</Text>
        </TouchableOpacity>
      </View>
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
  video: {
    width: '100%',
    height: '80%',
  },
});
