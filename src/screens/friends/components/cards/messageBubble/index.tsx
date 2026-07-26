import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { MessageItem } from '../../../../../api/chat';
import { parseSharedPostId, stripShareUrl } from '../../../../../utils/sharedPost';
import SharedPostCard from '../sharedPostCard';

interface Props {
  message: MessageItem;
}

// Bolha de uma mensagem de DM: à direita quando é minha, à esquerda quando é do
// amigo. Se a mensagem carrega um link de post (compartilhamento), renderiza um
// card de preview em vez de mostrar a URL crua.
export default function MessageBubble({ message }: Props) {
  const { t } = useTranslation();
  const mine = message.is_mine;
  const removed = message.status === 'removed';

  const sharedId = removed ? null : parseSharedPostId(message.body);
  const residual =
    sharedId && message.body ? stripShareUrl(message.body) : message.body;

  return (
    <View className={`max-w-[86%] my-0.5 ${mine ? 'self-end' : 'self-start'}`}>
      {removed ? (
        <View
          className={`px-3 py-2 rounded-[14px] ${
            mine ? 'bg-primary-500 rounded-br-[4px]' : 'bg-[#f1ecec] rounded-bl-[4px]'
          }`}>
          <Text
            maxFontSizeMultiplier={0}
            className={`text-[14px] leading-[19px] italic ${mine ? 'text-white' : 'text-[#2b2b2b]'}`}>
            {t('chat.messageRemoved')}
          </Text>
        </View>
      ) : (
        <>
          {residual ? (
            <View
              className={`px-3 py-2 rounded-[14px] ${
                mine ? 'bg-primary-500 rounded-br-[4px]' : 'bg-[#f1ecec] rounded-bl-[4px]'
              }`}>
              <Text
                maxFontSizeMultiplier={0}
                className={`text-[14px] leading-[19px] ${mine ? 'text-white' : 'text-[#2b2b2b]'}`}>
                {residual}
              </Text>
            </View>
          ) : null}
          {sharedId ? <SharedPostCard postId={sharedId} /> : null}
        </>
      )}
    </View>
  );
}
