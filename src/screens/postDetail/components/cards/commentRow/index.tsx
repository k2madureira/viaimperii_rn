import React from 'react';
import { Image, View } from 'react-native';
import Text from '../../../../../components/text';
import { FeedComment } from '../../../../../api/feed';
import { parseBackendDate } from '../../../../../utils/date';
import { initials } from '../../../../../utils/name';

interface Props {
  comment: FeedComment;
}

export default function CommentRow({ comment }: Props) {
  const avatarUrl = comment.author.active_avatar?.url ?? comment.author.image ?? null;
  const d = parseBackendDate(comment.created_at);
  const time = d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';

  return (
    <View className={`flex-row ${comment.parent_id ? 'pl-10' : ''} px-4 py-2`}>
      <View className="w-8 h-8 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden mr-2.5">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 32, height: 32 }} resizeMode="cover" />
        ) : (
          <Text className="text-[11px] font-bold text-primary-500">{initials(comment.author.name)}</Text>
        )}
      </View>
      <View className="flex-1 bg-[#f7f4f4] rounded-[12px] px-3 py-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-extrabold text-charcoal" numberOfLines={1}>
            {comment.author.name}
          </Text>
          <Text className="text-[10px] text-[#aaa] ml-2">{time}</Text>
        </View>
        <Text className="text-[13px] text-[#333] leading-[18px] mt-0.5">{comment.body}</Text>
      </View>
    </View>
  );
}
