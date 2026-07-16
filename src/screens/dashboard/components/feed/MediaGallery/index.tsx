import React, { useMemo, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { FeedItem, PostMedia } from '../../../../../api/feed/feedApi';
import ImageViewerModal from '../ImageViewerModal';
import VideoViewerModal from '../VideoViewerModal';

interface Props {
  item: Pick<FeedItem, 'image_url' | 'media'>;
}

// Unifica a imagem legada (`image_url`) com a lista `media[]` numa única lista
// ordenada — o legado entra primeiro se a `media[]` ainda não o contém.
function normalize(item: Pick<FeedItem, 'image_url' | 'media'>): PostMedia[] {
  const media = item.media ?? [];
  if (item.image_url && !media.some((m) => m.url === item.image_url)) {
    return [{ key: item.image_url, type: 'image', url: item.image_url }, ...media];
  }
  return media;
}

// Grade estilo rede social: 1 = cheia; 2 = lado a lado; 3+ = uma grande + coluna
// com overlay "+N" na última quando houver mais do que cabe.
export default function MediaGallery({ item }: Props) {
  const list = useMemo(() => normalize(item), [item]);
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  if (list.length === 0) return null;

  const openMedia = (m: PostMedia) =>
    m.type === 'video' ? setVideoUri(m.url) : setViewerUri(m.url);

  const Cell = ({
    m,
    style,
    moreCount,
  }: {
    m: PostMedia;
    style: object;
    moreCount?: number;
  }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => openMedia(m)} style={style}>
      {m.type === 'video' ? (
        <View className="w-full h-full bg-[#1a1416] items-center justify-center">
          <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
            <Text className="text-white text-[18px] ml-0.5">▶</Text>
          </View>
        </View>
      ) : (
        <Image source={{ uri: m.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      )}
      {moreCount ? (
        <View className="absolute inset-0 items-center justify-center bg-black/45">
          <Text className="text-white text-[22px] font-extrabold">+{moreCount}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  const gap = 2;

  return (
    <View className="mt-3">
      {list.length === 1 ? (
        <Cell m={list[0]} style={{ width: '100%', height: 220 }} />
      ) : list.length === 2 ? (
        <View className="flex-row" style={{ height: 200, gap }}>
          <Cell m={list[0]} style={{ flex: 1, height: '100%' }} />
          <Cell m={list[1]} style={{ flex: 1, height: '100%' }} />
        </View>
      ) : (
        <View className="flex-row" style={{ height: 240, gap }}>
          <Cell m={list[0]} style={{ flex: 2, height: '100%' }} />
          <View className="flex-1" style={{ gap }}>
            <Cell m={list[1]} style={{ flex: 1, width: '100%' }} />
            <Cell
              m={list[2]}
              style={{ flex: 1, width: '100%' }}
              moreCount={list.length > 3 ? list.length - 3 : undefined}
            />
          </View>
        </View>
      )}

      <ImageViewerModal uri={viewerUri} onClose={() => setViewerUri(null)} />
      <VideoViewerModal uri={videoUri} onClose={() => setVideoUri(null)} />
    </View>
  );
}
