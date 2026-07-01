import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ImageIcon } from '../../../../../components/icons';
import PostComposerForm from '../PostComposerForm';

interface Props {
  avatarUrl?: string | null;
  canLegion?: boolean;
  canProvince?: boolean;
}

export default function FeedComposer({ avatarUrl, canLegion, canProvince }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <TouchableOpacity
        onPress={() => setExpanded(true)}
        activeOpacity={0.85}
        className="flex-row items-center bg-white border border-[#f0eded] rounded-[16px] px-4 py-5">
        <View className="w-11 h-11 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden mr-3">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 44, height: 44 }} resizeMode="cover" />
          ) : (
            <Text className="text-[16px]">🛡️</Text>
          )}
        </View>
        <Text className="flex-1 text-[15px] text-[#999]">{t('feed.composerTeaser')}</Text>
        <ImageIcon size={20} color="#9E1B32" />
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-white border border-[#f0eded] rounded-[16px] p-4">
      <PostComposerForm
        canLegion={canLegion}
        canProvince={canProvince}
        onPosted={() => setExpanded(false)}
        onCancel={() => setExpanded(false)}
      />
    </View>
  );
}
