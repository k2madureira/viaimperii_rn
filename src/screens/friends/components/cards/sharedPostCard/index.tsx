import React from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Text from '../../../../../components/text';
import { viaimperiiApi } from '../../../../../api';
import { HomeNavigationProp } from '../../../../../navigation/HomeStack';
import { htmlToText } from '../../../../../utils/sharedPost';

// Mesma logo dos e-mails/OG do backend — fallback quando o post não tem imagem.
const LOGO_URL = 'https://viaimperii.s3.us-east-1.amazonaws.com/logos/via-imperii-logo.png';

interface Props {
  postId: number;
}

// Preview de um post compartilhado numa DM: imagem + autor + trecho. Toca → abre o
// post. Renderiza o card que o chat interno não desdobra sozinho a partir do link.
export default function SharedPostCard({ postId }: Props) {
  const navigation = useNavigation<HomeNavigationProp>();
  const q = useQuery({
    queryKey: ['feed-event', postId],
    queryFn: () => viaimperiiApi.feed.detail(postId),
    staleTime: 60_000,
    retry: false,
  });
  const post = q.data;

  const postImage = post?.media?.find((m) => m.type === 'image')?.url ?? post?.image_url ?? null;
  // Sem imagem própria → cai na logo (contida, sobre fundo claro).
  const image = postImage ?? LOGO_URL;
  const isLogo = !postImage;
  const author = post?.author?.name ?? '';
  const text = htmlToText(post?.body);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={!post}
      onPress={() => post && navigation.navigate('PostDetail', { post })}
      className="mt-1 rounded-[12px] overflow-hidden bg-white border border-[#e7dede]"
      style={{ width: 240, maxWidth: '100%' }}>
      {post ? (
        <View style={isLogo ? { backgroundColor: '#f4eaea' } : undefined}>
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: isLogo ? 96 : 130 }}
            resizeMode={isLogo ? 'contain' : 'cover'}
          />
        </View>
      ) : null}
      <View className="p-2.5">
        {q.isLoading ? (
          <View className="py-2 items-center">
            <ActivityIndicator size="small" color="#9E1B32" />
          </View>
        ) : q.isError ? (
          <Text className="text-[12px] text-[#9a8f8f]" maxFontSizeMultiplier={0}>
            Via Imperii
          </Text>
        ) : (
          <>
            {author ? (
              <Text
                className="text-[12px] font-bold text-charcoal"
                numberOfLines={1}
                maxFontSizeMultiplier={0}>
                {author}
              </Text>
            ) : null}
            {text ? (
              <Text
                className="text-[12px] text-[#555] mt-0.5"
                numberOfLines={2}
                maxFontSizeMultiplier={0}>
                {text}
              </Text>
            ) : null}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
