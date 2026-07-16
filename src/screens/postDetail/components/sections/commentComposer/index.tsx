import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCreateComment } from '../../../../dashboard/model/mutations/useCreateComment';

interface Props {
  postId: number;
  inputRef: React.RefObject<TextInput | null>;
  bottomInset: number;
  onCommentCreated: () => void;
}

// Campo de novo comentário (rodapé fixo).
export default function CommentComposer({
  postId,
  inputRef,
  bottomInset,
  onCommentCreated,
}: Props) {
  const { t } = useTranslation();
  const createM = useCreateComment();
  const [text, setText] = useState('');

  const submit = () => {
    const body = text.trim();
    if (!body) return;
    createM.mutate(
      { eventId: postId, body },
      {
        onSuccess: () => {
          setText('');
          onCommentCreated();
        },
      },
    );
  };

  return (
    <View
      className="flex-row items-end gap-2 px-4 pt-2 border-t border-[#f0eded] bg-white"
      style={{ paddingBottom: Math.max(bottomInset, 8) }}>
      <TextInput
        ref={inputRef}
        value={text}
        onChangeText={setText}
        placeholder={t('feed.commentPlaceholder')}
        placeholderTextColor="#aaa"
        multiline
        maxLength={1000}
        className="flex-1 bg-[#f7f4f4] rounded-[16px] px-3.5 py-2.5 text-[14px] text-charcoal max-h-[100px]"
        style={{ textAlignVertical: 'top' }}
      />
      <TouchableOpacity
        onPress={submit}
        disabled={!text.trim() || createM.isPending}
        activeOpacity={0.85}
        className={`rounded-full w-11 h-11 items-center justify-center ${
          text.trim() && !createM.isPending ? 'bg-primary-500' : 'bg-primary-500/40'
        }`}>
        {createM.isPending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text className="text-[16px] text-white">➤</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
