import React from 'react';
import { Image, View } from 'react-native';
import { Legion } from '../../../../../api/legions/legionsApi';

interface Props {
  legions: Legion[];
  onImageSettled: () => void;
}

// Pré-carrega as imagens das legiões fora da tela, para o conteúdo aparecer
// de uma vez (sem pop-in) quando o esqueleto sair.
export default function ImagePreloader({ legions, onImageSettled }: Props) {
  return (
    <View style={{ position: 'absolute', opacity: 0, width: 1, height: 1, overflow: 'hidden' }}>
      {legions.map((l) =>
        l.thumb_url ?? l.image_url ? (
          <Image
            key={l.id}
            source={{ uri: (l.thumb_url ?? l.image_url) as string }}
            style={{ width: 1, height: 1 }}
            onLoad={onImageSettled}
            onError={onImageSettled}
          />
        ) : null,
      )}
    </View>
  );
}
