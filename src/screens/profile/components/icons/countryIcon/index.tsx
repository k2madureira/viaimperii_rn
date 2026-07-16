import React from 'react';
import { Image, Text } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface Props {
  url: string | null;
}

// Ícone de país: os assets são SVG (countries/<id>/<slug>.svg). <Image> não
// renderiza SVG remoto, então usamos SvgUri; raster (.png) cai no <Image>.
export default function CountryIcon({ url }: Props) {
  if (!url) return <Text className="text-[16px]">🏛️</Text>;
  if (url.toLowerCase().endsWith('.svg')) {
    return <SvgUri uri={url} width={22} height={22} />;
  }
  return <Image source={{ uri: url }} style={{ width: 22, height: 22 }} resizeMode="contain" />;
}
